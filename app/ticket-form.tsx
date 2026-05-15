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

// ─── COLOURS ──────────────────────────────────────────────────────────────────
const PURPLE_DARK = "#4C1D95";
const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#EDE9FE";
const GOLD = "#F59E0B";
const GREEN = "#16A34A";
const BG = "#F5F3FF";
const CARD = "#FFFFFF";
const TEXT_C = "#1E1B4B";
const MUTED = "#6B7280";
const BORDER = "#DDD6FE";
const RED = "#DC2626";

// ─── HELPER: labelled input field ────────────────────────────────────────────
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  required = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
  required?: boolean;
  maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.wrap}>
      <Text style={f.label}>
        {label}
        {required && <Text style={f.required}> *</Text>}
      </Text>
      <TextInput
        style={[f.input, focused && f.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="next"
      />
    </View>
  );
}

const f = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "800", color: TEXT_C, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 },
  required: { color: RED },
  input: {
    backgroundColor: CARD, borderRadius: 14, borderWidth: 1.5, borderColor: BORDER,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: TEXT_C, fontWeight: "600",
  },
  inputFocused: { borderColor: PURPLE },
});

// ─── TICKET COMPONENT ─────────────────────────────────────────────────────────
function BusTicket({
  bookingRef, agency, from, to, date, dep, arr, plate,
  busClass, seats, price, passengerName, age,
  idImageUri, busColor,
}: {
  bookingRef: string; agency: string; from: string; to: string;
  date: string; dep: string; arr: string; plate: string;
  busClass: string; seats: string[]; price: number;
  passengerName: string; age: string; idImageUri: string | null;
  busColor: string;
}) {
  const total = price * seats.length;
  const ticketNum = `TKT-${bookingRef}-${Date.now().toString().slice(-4)}`;

  return (
    <View style={tk.ticket}>
      {/* Top colored header strip */}
      <View style={[tk.header, { backgroundColor: busColor }]}>
        <View style={tk.headerLeft}>
          <Text style={tk.agencyName}>{agency}</Text>
          <Text style={tk.ticketNum}>{ticketNum}</Text>
        </View>
        <Text style={tk.busIcon}>🚌</Text>
      </View>

      {/* Notch cut-outs */}
      <View style={tk.notchRow}>
        <View style={tk.notch} />
        <View style={tk.dividerDash} />
        <View style={tk.notch} />
      </View>

      {/* Route */}
      <View style={tk.routeRow}>
        <View style={{ flex: 1 }}>
          <Text style={tk.cityLabel}>FROM</Text>
          <Text style={tk.cityName}>{from}</Text>
          <Text style={[tk.timeText, { color: busColor }]}>{dep}</Text>
        </View>
        <View style={tk.arrowWrap}>
          <Text style={[tk.arrow, { color: busColor }]}>✈ →</Text>
          <Text style={tk.busClassBadge}>{busClass}</Text>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={tk.cityLabel}>TO</Text>
          <Text style={tk.cityName}>{to}</Text>
          <Text style={[tk.timeText, { color: busColor }]}>{arr}</Text>
        </View>
      </View>

      {/* Details grid */}
      <View style={tk.grid}>
        {[
          { label: "Date",      value: date || "—" },
          { label: "Seat(s)",   value: seats.join(", ") },
          { label: "Plate No.", value: plate },
          { label: "Booking Ref", value: bookingRef },
        ].map((item, i) => (
          <View key={i} style={tk.gridItem}>
            <Text style={tk.gridLabel}>{item.label}</Text>
            <Text style={tk.gridValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Second notch + dashes */}
      <View style={tk.notchRow}>
        <View style={tk.notch} />
        <View style={tk.dividerDash} />
        <View style={tk.notch} />
      </View>

      {/* Passenger section */}
      <View style={tk.passengerRow}>
        {idImageUri ? (
          <Image source={{ uri: idImageUri }} style={tk.idThumb} resizeMode="cover" />
        ) : (
          <View style={[tk.idThumbPlaceholder, { borderColor: busColor }]}>
            <Text style={{ fontSize: 22 }}>🪪</Text>
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={tk.passengerLabel}>PASSENGER</Text>
          <Text style={tk.passengerName}>{passengerName || "—"}</Text>
          <Text style={tk.passengerAge}>Age: {age || "—"}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={tk.totalLabel}>TOTAL</Text>
          <Text style={[tk.totalValue, { color: busColor }]}>{total.toLocaleString()}</Text>
          <Text style={tk.totalCurrency}>XAF</Text>
        </View>
      </View>

      {/* Footer barcode-like strip */}
      <View style={[tk.footer, { backgroundColor: busColor + "15", borderColor: busColor + "30" }]}>
        <Text style={[tk.footerText, { color: busColor }]}>
          ▐ ▌▐▌▐▐▌▌▐ ▌▐▌ ▐▌▐ ▌▐▌▐▐▌  {bookingRef}  ▐▌▐ ▌▐▌▐▐▌▌ ▌▐ ▌
        </Text>
        <Text style={tk.footerSub}>Show this ticket at the terminal · Valid for travel date only</Text>
      </View>
    </View>
  );
}

const tk = StyleSheet.create({
  ticket: {
    backgroundColor: CARD, borderRadius: 20,
    shadowColor: PURPLE_DARK, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
    overflow: "hidden", marginBottom: 20,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18 },
  headerLeft: {},
  agencyName: { fontSize: 20, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  ticketNum: { fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: "600", marginTop: 2 },
  busIcon: { fontSize: 36 },

  notchRow: { flexDirection: "row", alignItems: "center", marginVertical: 0 },
  notch: { width: 20, height: 20, borderRadius: 10, backgroundColor: BG, marginHorizontal: -10 },
  dividerDash: { flex: 1, borderTopWidth: 1.5, borderTopColor: BORDER, borderStyle: "dashed" },

  routeRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 18 },
  cityLabel: { fontSize: 9, fontWeight: "800", color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  cityName: { fontSize: 18, fontWeight: "900", color: TEXT_C, letterSpacing: -0.5 },
  timeText: { fontSize: 15, fontWeight: "800", marginTop: 2 },
  arrowWrap: { flex: 1.2, alignItems: "center", gap: 4 },
  arrow: { fontSize: 18, fontWeight: "900" },
  busClassBadge: { fontSize: 9, fontWeight: "800", color: MUTED, textTransform: "uppercase", letterSpacing: 0.8, textAlign: "center" },

  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  gridItem: { width: "46%", backgroundColor: BG, borderRadius: 12, padding: 10 },
  gridLabel: { fontSize: 9, color: MUTED, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
  gridValue: { fontSize: 12, color: TEXT_C, fontWeight: "800" },

  passengerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16 },
  idThumb: { width: 56, height: 56, borderRadius: 10 },
  idThumbPlaceholder: {
    width: 56, height: 56, borderRadius: 10, borderWidth: 1.5,
    borderStyle: "dashed", alignItems: "center", justifyContent: "center", backgroundColor: BG,
  },
  passengerLabel: { fontSize: 9, fontWeight: "800", color: MUTED, textTransform: "uppercase", letterSpacing: 1 },
  passengerName: { fontSize: 17, fontWeight: "900", color: TEXT_C, marginTop: 2 },
  passengerAge: { fontSize: 12, color: MUTED, fontWeight: "600", marginTop: 2 },
  totalLabel: { fontSize: 9, fontWeight: "800", color: MUTED, textTransform: "uppercase", letterSpacing: 1 },
  totalValue: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  totalCurrency: { fontSize: 11, color: MUTED, fontWeight: "700" },

  footer: { borderTopWidth: 1, padding: 12, alignItems: "center", gap: 4 },
  footerText: { fontSize: 8, fontWeight: "700", letterSpacing: 0.5, textAlign: "center" },
  footerSub: { fontSize: 10, color: MUTED, fontWeight: "600" },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function TicketFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    agency: string; from: string; to: string; date: string;
    dep: string; arr: string; plate: string; busClass: string;
    price: string; seats: string; color: string; bookingRef: string;
    busId: string; paymentMethod: string; bankName: string;
    bankAcc: string; receiptUri: string;
  }>();

  const {
    agency = "Agency", from = "City A", to = "City B", date = "",
    dep = "08:00", arr = "12:00", plate = "XX-0000-X",
    busClass = "Standard", price = "3000", seats = "A1",
    color = "#4C1D95", bookingRef = "CB-REF-000",
    paymentMethod = "mtn", bankName = "", bankAcc = "", receiptUri = "",
  } = params;

  const busColor = color.startsWith("%23") ? "#" + color.slice(3) : color;
  const seatList = seats.split(",");
  const priceNum = parseInt(price, 10) || 3000;

  // Form state
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [age, setAge]               = useState("");
  const [phone, setPhone]           = useState("");
  const [nationality, setNationality] = useState("");
  const [idNumber, setIdNumber]     = useState("");
  const [idType, setIdType]         = useState("National ID");
  const [idImageUri, setIdImageUri] = useState<string | null>(null);
  const [idImageName, setIdImageName] = useState<string | null>(null);
  const [showTicket, setShowTicket] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const ID_TYPES = ["National ID", "Passport", "Driver's Licence", "Birth Certificate"];
  const [showIdPicker, setShowIdPicker] = useState(false);

  const pickIdImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled && result.assets.length > 0) {
      setIdImageUri(result.assets[0].uri);
      setIdImageName(result.assets[0].fileName ?? "id-image.jpg");
    }
  };

  const handleGenerate = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Required", "Please enter your full name."); return;
    }
    if (!age.trim() || isNaN(parseInt(age))) {
      Alert.alert("Required", "Please enter a valid age."); return;
    }
    if (!idNumber.trim()) {
      Alert.alert("Required", "Please enter your ID number."); return;
    }
    // Show ticket
    setShowTicket(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  };

  const payMethodLabel =
    paymentMethod === "mtn"    ? "MTN Mobile Money" :
    paymentMethod === "orange" ? "Orange Money"     :
    `Bank Transfer (${bankName})`;

  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[s.header, { backgroundColor: busColor }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{showTicket ? "Your Ticket" : "Passenger Details"}</Text>
          <Text style={s.headerSub}>{from} → {to}</Text>
        </View>
        <View style={{ width: 40 }} />
        <View style={s.hCircle1} />
        <View style={s.hCircle2} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {!showTicket ? (
          <>
            {/* Payment confirmation strip */}
            <View style={[s.payConfirmStrip, { backgroundColor: "#DCFCE7", borderColor: "#16A34A40" }]}>
              <Text style={s.payConfirmIcon}>✅</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.payConfirmTitle}>Payment Submitted</Text>
                <Text style={s.payConfirmSub}>{payMethodLabel} · {(priceNum * seatList.length).toLocaleString()} XAF</Text>
              </View>
            </View>

            {/* Form sections */}
            <Text style={s.sectionLabel}>👤  Personal Information</Text>

            <View style={s.card}>
              <Field label="First Name" value={firstName} onChangeText={setFirstName} placeholder="e.g. Jean" required />
              <Field label="Last Name"  value={lastName}  onChangeText={setLastName}  placeholder="e.g. Mbarga" required />
              <Field label="Age"        value={age}       onChangeText={setAge}        placeholder="e.g. 28" keyboardType="numeric" required maxLength={3} />
              <Field label="Phone Number" value={phone}   onChangeText={setPhone}      placeholder="e.g. 677 000 000" keyboardType="phone-pad" />
              <Field label="Nationality" value={nationality} onChangeText={setNationality} placeholder="e.g. Cameroonian" />
            </View>

            <Text style={s.sectionLabel}>🪪  ID / Travel Document</Text>
            <View style={s.card}>
              {/* ID Type picker */}
              <View style={f.wrap}>
                <Text style={f.label}>ID Type <Text style={{ color: RED }}>*</Text></Text>
                <TouchableOpacity
                  style={[f.input, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
                  onPress={() => setShowIdPicker(true)}
                  activeOpacity={0.75}
                >
                  <Text style={{ fontSize: 15, color: TEXT_C, fontWeight: "600" }}>{idType}</Text>
                  <Text style={{ color: MUTED }}>▼</Text>
                </TouchableOpacity>
              </View>

              <Field label="ID / Document Number" value={idNumber} onChangeText={setIdNumber} placeholder="e.g. CM123456789" required />

              {/* ID image */}
              <View style={f.wrap}>
                <Text style={f.label}>ID Document Image</Text>
                <TouchableOpacity style={[s.idImageBox, idImageUri && s.idImageBoxDone]} onPress={pickIdImage} activeOpacity={0.8}>
                  {idImageUri ? (
                    <View style={s.idPreviewWrap}>
                      <Image source={{ uri: idImageUri }} style={s.idPreview} resizeMode="cover" />
                      <View style={s.idOverlay}>
                        <Text style={{ fontSize: 22 }}>✅</Text>
                        <Text style={s.idOverlayLabel}>{idImageName}</Text>
                        <Text style={s.idOverlaySub}>Tap to change</Text>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={{ fontSize: 30, marginBottom: 8 }}>📷</Text>
                      <Text style={s.idImageTitle}>Upload ID Photo</Text>
                      <Text style={s.idImageSub}>Photo of your {idType}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <Text style={s.sectionLabel}>🎟️  Booking Summary</Text>
            <View style={s.summaryCard}>
              {[
                { label: "Agency",   value: agency },
                { label: "Route",    value: `${from} → ${to}` },
                { label: "Date",     value: date || "—" },
                { label: "Departs",  value: dep },
                { label: "Arrives",  value: arr },
                { label: "Seat(s)",  value: seatList.join(", ") },
                { label: "Class",    value: busClass },
                { label: "Plate",    value: plate },
                { label: "Ref",      value: bookingRef },
                { label: "Total",    value: `${(priceNum * seatList.length).toLocaleString()} XAF` },
              ].map((item, i) => (
                <View key={i} style={[s.summaryRow, i < 9 && s.summaryBorder]}>
                  <Text style={s.summaryLabel}>{item.label}</Text>
                  <Text style={[s.summaryValue, item.label === "Total" && { color: busColor, fontSize: 16 }]}>{item.value}</Text>
                </View>
              ))}
            </View>

            <View style={{ height: 130 }} />
          </>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={s.successHeader}>
              <Text style={s.successEmoji}>🎉</Text>
              <Text style={s.successTitle}>Ticket Generated!</Text>
              <Text style={s.successSub}>Your bus ticket is ready. Show it at the {agency} terminal at least 20 minutes before departure.</Text>
            </View>

            <BusTicket
              bookingRef={bookingRef}
              agency={agency}
              from={from} to={to}
              date={date} dep={dep} arr={arr}
              plate={plate} busClass={busClass}
              seats={seatList} price={priceNum}
              passengerName={fullName}
              age={age}
              idImageUri={idImageUri}
              busColor={busColor}
            />

            <View style={s.noticeBox}>
              <Text style={s.noticeText}>
                📌 Your ticket and payment receipt will be verified by {agency} staff before boarding. Keep this screen accessible.
              </Text>
            </View>
            <View style={{ height: 130 }} />
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.bottomBar}>
        {!showTicket ? (
          <TouchableOpacity style={[s.mainBtn, { backgroundColor: busColor }]} onPress={handleGenerate} activeOpacity={0.85}>
            <Text style={s.mainBtnText}>🎟️  Generate Bus Ticket</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.mainBtn, { backgroundColor: GREEN }]}
            onPress={() => router.push("/")}
            activeOpacity={0.85}
          >
            <Text style={s.mainBtnText}>✅  Done — Back to Home</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ID Type picker modal */}
      <Modal visible={showIdPicker} transparent animationType="slide" onRequestClose={() => setShowIdPicker(false)}>
        <View style={s.overlay}>
          <View style={s.pickerSheet}>
            <View style={s.handle} />
            <Text style={s.pickerTitle}>Select ID Type</Text>
            {ID_TYPES.map(t => (
              <TouchableOpacity key={t} style={[s.pickerRow, idType === t && { backgroundColor: PURPLE_LIGHT }]} onPress={() => { setIdType(t); setShowIdPicker(false); }}>
                <Text style={[s.pickerRowText, idType === t && { color: PURPLE, fontWeight: "800" }]}>{t}</Text>
                {idType === t && <Text style={{ color: PURPLE }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <View style={{ height: 20 }} />
          </View>
        </View>
      </Modal>
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

  sectionLabel: { fontSize: 12, fontWeight: "800", color: MUTED, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, marginTop: 16 },

  payConfirmStrip: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 16, borderWidth: 1.5, padding: 14, marginBottom: 4,
  },
  payConfirmIcon: { fontSize: 24 },
  payConfirmTitle: { fontSize: 14, fontWeight: "800", color: "#15803D" },
  payConfirmSub: { fontSize: 12, color: "#166534", fontWeight: "600", marginTop: 2 },

  card: {
    backgroundColor: CARD, borderRadius: 20, borderWidth: 1.5, borderColor: BORDER,
    padding: 16, marginBottom: 4,
    shadowColor: PURPLE_DARK, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },

  idImageBox: {
    backgroundColor: BG, borderRadius: 16, borderWidth: 2, borderColor: BORDER, borderStyle: "dashed",
    padding: 20, alignItems: "center", minHeight: 130,
  },
  idImageBoxDone: { padding: 0, borderStyle: "solid", borderColor: "#16A34A", overflow: "hidden" },
  idPreviewWrap: { width: "100%", height: 140, position: "relative" },
  idPreview: { width: "100%", height: "100%" },
  idOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", gap: 4 },
  idOverlayLabel: { fontSize: 12, color: "#fff", fontWeight: "700" },
  idOverlaySub: { fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  idImageTitle: { fontSize: 14, fontWeight: "800", color: TEXT_C, marginBottom: 4 },
  idImageSub: { fontSize: 12, color: MUTED, fontWeight: "600" },

  summaryCard: {
    backgroundColor: CARD, borderRadius: 20, borderWidth: 1.5, borderColor: BORDER,
    overflow: "hidden",
    shadowColor: PURPLE_DARK, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  summaryBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  summaryLabel: { fontSize: 12, color: MUTED, fontWeight: "600" },
  summaryValue: { fontSize: 13, color: TEXT_C, fontWeight: "800", flex: 1, textAlign: "right" },

  successHeader: { alignItems: "center", paddingVertical: 16 },
  successEmoji: { fontSize: 52, marginBottom: 10 },
  successTitle: { fontSize: 26, fontWeight: "900", color: TEXT_C, letterSpacing: -0.5, marginBottom: 8 },
  successSub: { fontSize: 13, color: MUTED, textAlign: "center", lineHeight: 20, paddingHorizontal: 10, marginBottom: 20 },

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
  mainBtn: { borderRadius: 18, paddingVertical: 17, alignItems: "center" },
  mainBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  pickerSheet: { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 18 },
  pickerTitle: { fontSize: 20, fontWeight: "900", color: TEXT_C, marginBottom: 12 },
  pickerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderRadius: 12, paddingHorizontal: 12, marginBottom: 4 },
  pickerRowText: { fontSize: 15, color: TEXT_C, fontWeight: "600" },
});