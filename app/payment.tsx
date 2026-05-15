import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

// ─── COLOURS (match app palette) ─────────────────────────────────────────────
const PURPLE_DARK = "#4C1D95";
const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#EDE9FE";
const GOLD = "#F59E0B";
const GREEN = "#16A34A";
const GREEN_LIGHT = "#DCFCE7";
const ORANGE = "#EA580C";
const BG = "#F5F3FF";
const CARD = "#FFFFFF";
const TEXT_C = "#1E1B4B";
const MUTED = "#6B7280";
const BORDER = "#DDD6FE";

// ─── PAYMENT CONFIG PER AGENCY ────────────────────────────────────────────────
// Each agency has MTN MoMo, Orange MoMo, and preferred bank accounts.
// The "accountName" is the company name.
const AGENCY_PAYMENT_CONFIG: Record<
  string,
  {
    mtn: { number: string; accountName: string };
    orange: { number: string; accountName: string };
    banks: { name: string; accountNumber: string; accountName: string }[];
  }
> = {
  // ── Vatican Express ──────────────────────────────────────────────────────
  "Vatican Express": {
    mtn:    { number: "670 000 001", accountName: "Vatican Express" },
    orange: { number: "695 000 001", accountName: "Vatican Express" },
    banks: [
      { name: "UBA Bank",    accountNumber: "1001234567890", accountName: "Vatican Express" },
      { name: "Ecobank",     accountNumber: "2001234567890", accountName: "Vatican Express" },
      { name: "Afriland",    accountNumber: "3001234567890", accountName: "Vatican Express" },
    ],
  },
  // ── General Voyages ──────────────────────────────────────────────────────
  "General Voyages": {
    mtn:    { number: "670 000 002", accountName: "General Voyages" },
    orange: { number: "695 000 002", accountName: "General Voyages" },
    banks: [
      { name: "UBA Bank",    accountNumber: "1002345678901", accountName: "General Voyages" },
      { name: "Ecobank",     accountNumber: "2002345678901", accountName: "General Voyages" },
      { name: "BEAC",        accountNumber: "3002345678901", accountName: "General Voyages" },
    ],
  },
  // ── Touristique Express ───────────────────────────────────────────────────
  "Touristique Express": {
    mtn:    { number: "677 100 001", accountName: "Touristique Express" },
    orange: { number: "699 100 001", accountName: "Touristique Express" },
    banks: [
      { name: "UBA Bank",    accountNumber: "1003456789012", accountName: "Touristique Express" },
      { name: "Ecobank",     accountNumber: "2003456789012", accountName: "Touristique Express" },
      { name: "SCB Cameroun",accountNumber: "3003456789012", accountName: "Touristique Express" },
    ],
  },
  // ── Amour Mezam ──────────────────────────────────────────────────────────
  "Amour Mezam": {
    mtn:    { number: "675 200 001", accountName: "Amour Mezam" },
    orange: { number: "693 200 001", accountName: "Amour Mezam" },
    banks: [
      { name: "UBA Bank",    accountNumber: "1004567890123", accountName: "Amour Mezam" },
      { name: "Ecobank",     accountNumber: "2004567890123", accountName: "Amour Mezam" },
      { name: "Afriland",    accountNumber: "3004567890123", accountName: "Amour Mezam" },
    ],
  },
  // ─── fallback for any other agency ───────────────────────────────────────
  DEFAULT: {
    mtn:    { number: "670 000 000", accountName: "Bus Agency" },
    orange: { number: "695 000 000", accountName: "Bus Agency" },
    banks: [
      { name: "UBA Bank", accountNumber: "1000000000000", accountName: "Bus Agency" },
      { name: "Ecobank",  accountNumber: "2000000000000", accountName: "Bus Agency" },
    ],
  },
};

function getPaymentConfig(agency: string) {
  return AGENCY_PAYMENT_CONFIG[agency] ?? {
    ...AGENCY_PAYMENT_CONFIG.DEFAULT,
    mtn:    { ...AGENCY_PAYMENT_CONFIG.DEFAULT.mtn,    accountName: agency },
    orange: { ...AGENCY_PAYMENT_CONFIG.DEFAULT.orange, accountName: agency },
    banks:  AGENCY_PAYMENT_CONFIG.DEFAULT.banks.map(b => ({ ...b, accountName: agency })),
  };
}

// ─── PAYMENT METHOD CARD ──────────────────────────────────────────────────────
function PaymentCard({
  selected,
  onPress,
  icon,
  label,
  color,
  number,
  accountName,
  children,
}: {
  selected: boolean;
  onPress: () => void;
  icon: string;
  label: string;
  color: string;
  number: string;
  accountName: string;
  children?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={[
        ps.methodCard,
        selected && { borderColor: color, backgroundColor: color + "0D" },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={ps.methodHeader}>
        <View style={[ps.methodIconWrap, { backgroundColor: color + "20" }]}>
          <Text style={ps.methodIcon}>{icon}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={ps.methodLabel}>{label}</Text>
          <Text style={[ps.methodNumber, { color }]}>{number}</Text>
          <Text style={ps.methodAccount}>Account: {accountName}</Text>
        </View>
        <View
          style={[
            ps.radioOuter,
            { borderColor: selected ? color : BORDER },
          ]}
        >
          {selected && (
            <View style={[ps.radioInner, { backgroundColor: color }]} />
          )}
        </View>
      </View>
      {selected && children}
    </TouchableOpacity>
  );
}

// ─── BANK PICKER MODAL ────────────────────────────────────────────────────────
function BankPickerModal({
  visible,
  banks,
  onSelect,
  onClose,
  busColor,
}: {
  visible: boolean;
  banks: { name: string; accountNumber: string; accountName: string }[];
  onSelect: (bank: { name: string; accountNumber: string; accountName: string }) => void;
  onClose: () => void;
  busColor: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={ps.overlay}>
        <View style={ps.sheetSmall}>
          <View style={ps.handle} />
          <Text style={ps.sheetTitle}>Select Your Bank</Text>
          {banks.map((b, i) => (
            <TouchableOpacity
              key={i}
              style={ps.bankRow}
              onPress={() => { onSelect(b); onClose(); }}
              activeOpacity={0.75}
            >
              <Text style={ps.bankIcon}>🏦</Text>
              <View style={{ flex: 1 }}>
                <Text style={ps.bankName}>{b.name}</Text>
                <Text style={ps.bankAcc}>A/C: {b.accountNumber}</Text>
                <Text style={ps.bankHolder}>Name: {b.accountName}</Text>
              </View>
              <Text style={[ps.bankSelect, { color: busColor }]}>Select →</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={ps.cancelBtn} onPress={onClose}>
            <Text style={ps.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <View style={{ height: 20 }} />
        </View>
      </View>
    </Modal>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    agency: string; from: string; to: string; date: string;
    dep: string; arr: string; plate: string; busClass: string;
    price: string; seats: string; color: string; bookingRef: string;
    busId: string;
  }>();

  const {
    agency = "Agency", from = "City A", to = "City B", date = "",
    dep = "08:00", arr = "12:00", plate = "XX-0000-X",
    busClass = "Standard", price = "3000", seats = "A1",
    color = "#4C1D95", bookingRef = "CB-REF-000", busId = "B001",
  } = params;

  const busColor = color.startsWith("%23") ? "#" + color.slice(3) : color;
  const seatList = seats.split(",");
  const priceNum = parseInt(price, 10) || 3000;
  const totalAmount = priceNum * seatList.length;
  const cfg = getPaymentConfig(agency);

  type Method = "mtn" | "orange" | "bank" | null;
  const [selectedMethod, setSelectedMethod] = useState<Method>(null);
  const [selectedBank, setSelectedBank] = useState<(typeof cfg.banks)[0] | null>(null);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);

  const pickReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setReceiptUri(asset.uri);
      setReceiptFileName(asset.fileName ?? "receipt.jpg");
    }
  };

  const handleContinue = () => {
    if (!selectedMethod) {
      Alert.alert("Payment Method", "Please select a payment method.");
      return;
    }
    if (selectedMethod === "bank" && !selectedBank) {
      Alert.alert("Bank", "Please select your bank.");
      return;
    }
    if (!receiptUri) {
      Alert.alert("Receipt Required", "Please upload your payment receipt before continuing.");
      return;
    }
    // Navigate to ticket info form
    const bankName = selectedBank?.name ?? "";
    const bankAcc  = selectedBank?.accountNumber ?? "";
    router.push({
      pathname: "/ticket-form",
      params: {
        agency, from, to, date, dep, arr, plate, busClass,
        price, seats, color, bookingRef, busId,
        paymentMethod: selectedMethod,
        bankName, bankAcc, receiptUri,
      },
    });
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[s.header, { backgroundColor: busColor }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Payment</Text>
          <Text style={s.headerSub}>{from} → {to}</Text>
        </View>
        <View style={{ width: 40 }} />
        <View style={s.hCircle1} />
        <View style={s.hCircle2} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Amount summary */}
        <View style={[s.amountCard, { borderColor: busColor + "40" }]}>
          <Text style={s.amountLabel}>Amount Due</Text>
          <Text style={[s.amountValue, { color: busColor }]}>
            {totalAmount.toLocaleString()} XAF
          </Text>
          <Text style={s.amountSub}>
            {seatList.length} seat{seatList.length > 1 ? "s" : ""} ({seatList.join(", ")}) · {priceNum.toLocaleString()} XAF each
          </Text>
          <View style={s.amountMeta}>
            <Text style={s.amountMetaText}>📋 Ref: {bookingRef}</Text>
            <Text style={s.amountMetaText}>🏢 {agency}</Text>
          </View>
        </View>

        {/* Section: Mobile Money */}
        <Text style={s.sectionLabel}>💳  Mobile Money</Text>

        <PaymentCard
          selected={selectedMethod === "mtn"}
          onPress={() => setSelectedMethod("mtn")}
          icon="🟡"
          label="MTN Mobile Money"
          color="#F59E0B"
          number={cfg.mtn.number}
          accountName={cfg.mtn.accountName}
        >
          <View style={s.instructionBox}>
            <Text style={s.instructionTitle}>How to pay (MTN MoMo)</Text>
            <Text style={s.instructionStep}>1. Dial *126# or open MTN MoMo app</Text>
            <Text style={s.instructionStep}>2. Select "Transfer"</Text>
            <Text style={s.instructionStep}>3. Enter number: <Text style={{ fontWeight: "800" }}>{cfg.mtn.number}</Text></Text>
            <Text style={s.instructionStep}>4. Enter amount: <Text style={{ fontWeight: "800" }}>{totalAmount.toLocaleString()} XAF</Text></Text>
            <Text style={s.instructionStep}>5. Name shows: <Text style={{ fontWeight: "800" }}>{cfg.mtn.accountName}</Text></Text>
            <Text style={s.instructionStep}>6. Confirm & save your receipt SMS</Text>
          </View>
        </PaymentCard>

        <PaymentCard
          selected={selectedMethod === "orange"}
          onPress={() => setSelectedMethod("orange")}
          icon="🟠"
          label="Orange Mobile Money"
          color="#EA580C"
          number={cfg.orange.number}
          accountName={cfg.orange.accountName}
        >
          <View style={s.instructionBox}>
            <Text style={s.instructionTitle}>How to pay (Orange Money)</Text>
            <Text style={s.instructionStep}>1. Dial #150# or open Orange Money app</Text>
            <Text style={s.instructionStep}>2. Select "Envoyer de l'argent"</Text>
            <Text style={s.instructionStep}>3. Enter number: <Text style={{ fontWeight: "800" }}>{cfg.orange.number}</Text></Text>
            <Text style={s.instructionStep}>4. Enter amount: <Text style={{ fontWeight: "800" }}>{totalAmount.toLocaleString()} XAF</Text></Text>
            <Text style={s.instructionStep}>5. Name shows: <Text style={{ fontWeight: "800" }}>{cfg.orange.accountName}</Text></Text>
            <Text style={s.instructionStep}>6. Confirm & save your receipt SMS</Text>
          </View>
        </PaymentCard>

        {/* Section: Bank Transfer */}
        <Text style={s.sectionLabel}>🏦  Bank Transfer</Text>

        <PaymentCard
          selected={selectedMethod === "bank"}
          onPress={() => { setSelectedMethod("bank"); if (!selectedBank) setShowBankPicker(true); }}
          icon="🏛️"
          label={selectedBank ? selectedBank.name : "Select a Bank"}
          color="#1D4ED8"
          number={selectedBank ? selectedBank.accountNumber : "Tap to choose your bank"}
          accountName={selectedBank ? selectedBank.accountName : agency}
        >
          {selectedBank && (
            <View style={s.instructionBox}>
              <Text style={s.instructionTitle}>Bank Transfer Details</Text>
              <Text style={s.instructionStep}>Bank: <Text style={{ fontWeight: "800" }}>{selectedBank.name}</Text></Text>
              <Text style={s.instructionStep}>Account No.: <Text style={{ fontWeight: "800" }}>{selectedBank.accountNumber}</Text></Text>
              <Text style={s.instructionStep}>Account Name: <Text style={{ fontWeight: "800" }}>{selectedBank.accountName}</Text></Text>
              <Text style={s.instructionStep}>Amount: <Text style={{ fontWeight: "800" }}>{totalAmount.toLocaleString()} XAF</Text></Text>
              <Text style={s.instructionStep}>Narration: <Text style={{ fontWeight: "800" }}>{bookingRef}</Text></Text>
              <TouchableOpacity onPress={() => setShowBankPicker(true)} style={s.changeBankBtn}>
                <Text style={s.changeBankText}>🔄 Change Bank</Text>
              </TouchableOpacity>
            </View>
          )}
        </PaymentCard>

        {/* Receipt Upload */}
        <Text style={s.sectionLabel}>📎  Payment Receipt</Text>
        <TouchableOpacity style={[s.receiptBox, receiptUri && s.receiptBoxDone]} onPress={pickReceipt} activeOpacity={0.8}>
          {receiptUri ? (
            <View style={s.receiptPreviewWrap}>
              <Image source={{ uri: receiptUri }} style={s.receiptPreview} resizeMode="cover" />
              <View style={s.receiptOverlay}>
                <Text style={s.receiptDoneIcon}>✅</Text>
                <Text style={s.receiptDoneLabel}>{receiptFileName}</Text>
                <Text style={s.receiptChangeLabel}>Tap to change</Text>
              </View>
            </View>
          ) : (
            <>
              <Text style={s.receiptIcon}>📷</Text>
              <Text style={s.receiptTitle}>Upload Payment Receipt</Text>
              <Text style={s.receiptSub}>
                After making payment, upload a screenshot or photo of your transaction receipt
              </Text>
              <View style={[s.receiptBtn, { backgroundColor: busColor }]}>
                <Text style={s.receiptBtnText}>Choose Image / File</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Notice */}
        <View style={s.noticeBox}>
          <Text style={s.noticeText}>
            ⚠️ Your booking is only confirmed after receipt verification by {agency}. Please ensure the amount, reference number, and account details are correct.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom action */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={[s.continueBtn, { backgroundColor: selectedMethod && receiptUri ? busColor : "#D1D5DB" }]}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={s.continueBtnText}>
            {selectedMethod && receiptUri ? "Continue to Ticket Info →" : "Select Payment & Upload Receipt"}
          </Text>
        </TouchableOpacity>
      </View>

      <BankPickerModal
        visible={showBankPicker}
        banks={cfg.banks}
        onSelect={setSelectedBank}
        onClose={() => setShowBankPicker(false)}
        busColor={busColor}
      />
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: {
    paddingTop: Platform.OS === "android" ? 48 : 60,
    paddingHorizontal: 20, paddingBottom: 20,
    flexDirection: "row", alignItems: "center", overflow: "hidden", position: "relative",
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 20, color: "#fff", fontWeight: "900" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#fff", letterSpacing: -0.4 },
  headerSub: { fontSize: 11, color: "#C4B5FD", fontWeight: "500", marginTop: 2 },
  hCircle1: { position: "absolute", width: 160, height: 160, borderRadius: 80, backgroundColor: "#7C3AED", opacity: 0.2, right: -40, bottom: -60 },
  hCircle2: { position: "absolute", width: 90, height: 90, borderRadius: 45, backgroundColor: "#A78BFA", opacity: 0.12, right: 60, bottom: -20 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  sectionLabel: { fontSize: 12, fontWeight: "800", color: MUTED, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, marginTop: 20 },

  amountCard: {
    backgroundColor: CARD, borderRadius: 20, borderWidth: 1.5,
    padding: 20, marginBottom: 4,
    shadowColor: PURPLE_DARK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  amountLabel: { fontSize: 12, color: MUTED, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  amountValue: { fontSize: 36, fontWeight: "900", letterSpacing: -1, marginBottom: 4 },
  amountSub: { fontSize: 13, color: MUTED, fontWeight: "600", marginBottom: 12 },
  amountMeta: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  amountMetaText: { fontSize: 12, color: TEXT_C, fontWeight: "600" },

  // Payment card
  methodCard: {
    backgroundColor: CARD, borderRadius: 18, borderWidth: 2, borderColor: BORDER,
    padding: 16, marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  methodHeader: { flexDirection: "row", alignItems: "center" },
  methodIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  methodIcon: { fontSize: 22 },
  methodLabel: { fontSize: 15, fontWeight: "800", color: TEXT_C },
  methodNumber: { fontSize: 17, fontWeight: "900", letterSpacing: 0.5, marginTop: 2 },
  methodAccount: { fontSize: 11, color: MUTED, fontWeight: "600", marginTop: 1 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner: { width: 11, height: 11, borderRadius: 6 },

  instructionBox: { marginTop: 14, backgroundColor: BG, borderRadius: 12, padding: 14, gap: 4 },
  instructionTitle: { fontSize: 11, fontWeight: "800", color: TEXT_C, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 },
  instructionStep: { fontSize: 13, color: TEXT_C, fontWeight: "500", lineHeight: 20 },

  changeBankBtn: { marginTop: 10, alignSelf: "flex-start", backgroundColor: PURPLE_LIGHT, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  changeBankText: { fontSize: 12, color: PURPLE, fontWeight: "800" },

  // Receipt
  receiptBox: {
    backgroundColor: CARD, borderRadius: 18, borderWidth: 2,
    borderColor: BORDER, borderStyle: "dashed",
    padding: 24, alignItems: "center", marginBottom: 12, minHeight: 160,
  },
  receiptBoxDone: { borderStyle: "solid", borderColor: GREEN, padding: 0, overflow: "hidden" },
  receiptPreviewWrap: { width: "100%", height: 180, position: "relative" },
  receiptPreview: { width: "100%", height: "100%" },
  receiptOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center", gap: 4,
  },
  receiptDoneIcon: { fontSize: 28 },
  receiptDoneLabel: { fontSize: 13, color: "#fff", fontWeight: "700" },
  receiptChangeLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  receiptIcon: { fontSize: 36, marginBottom: 10 },
  receiptTitle: { fontSize: 15, fontWeight: "800", color: TEXT_C, marginBottom: 6 },
  receiptSub: { fontSize: 12, color: MUTED, textAlign: "center", lineHeight: 18, marginBottom: 16 },
  receiptBtn: { borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  receiptBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  noticeBox: { backgroundColor: "#FEF3C7", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#F59E0B30" },
  noticeText: { fontSize: 12, color: "#92400E", fontWeight: "600", lineHeight: 18 },

  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20, paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 36 : 20,
    borderTopWidth: 1.5, borderTopColor: BORDER,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 12,
  },
  continueBtn: { borderRadius: 18, paddingVertical: 17, alignItems: "center" },
  continueBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});

// ─── SMALL SHEET STYLES ──────────────────────────────────────────────────────
const ps = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheetSmall: {
    backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 22, paddingTop: 12,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 18 },
  sheetTitle: { fontSize: 20, fontWeight: "900", color: TEXT_C, marginBottom: 16 },

  bankRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  bankIcon: { fontSize: 24 },
  bankName: { fontSize: 15, fontWeight: "800", color: TEXT_C },
  bankAcc: { fontSize: 12, color: MUTED, fontWeight: "600", marginTop: 2 },
  bankHolder: { fontSize: 12, color: MUTED, fontWeight: "600" },
  bankSelect: { fontSize: 13, fontWeight: "800" },

  cancelBtn: { backgroundColor: PURPLE_LIGHT, borderRadius: 14, paddingVertical: 13, alignItems: "center", marginTop: 14 },
  cancelText: { color: PURPLE, fontWeight: "700", fontSize: 14 },

  // PaymentCard re-exports (used inline in component)
  methodCard: {}, methodHeader: {}, methodIconWrap: {}, methodIcon: {}, methodLabel: {},
  methodNumber: {}, methodAccount: {}, radioOuter: {}, radioInner: {},
});