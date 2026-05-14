import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLang } from "../context/LanguageContext";

// ─── COLOURS ─────────────────────────────────────────────────────────────────
const PURPLE_DARK = "#4C1D95";
const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#EDE9FE";
const PURPLE_MID = "#6D28D9";
const GOLD = "#F59E0B";
const GREEN = "#16A34A";
const RED = "#DC2626";
const BG = "#F5F3FF";
const CARD = "#FFFFFF";
const TEXT_C = "#1E1B4B";
const MUTED = "#6B7280";
const BORDER = "#DDD6FE";

// ─── MOCK BUS DATA ────────────────────────────────────────────────────────────
// Each agency has buses for various corridors – we filter by from/to at runtime
const ALL_BUSES = [
  // ── Yaoundé ↔ Douala ──────────────────────────────────────────────────────
  { id: "B001", agency: "United Express",      color: "#0891B2", emoji: "🩵", from: "Yaoundé", to: "Douala",     dep: "06:00", arr: "09:30", price: 3500,  seats: 12, total: 60, class: "VIP",      plate: "LT-9823-A", amenities: ["AC","WiFi","USB"], rating: 4.7 },
  { id: "B002", agency: "Général Express",     color: "#1D4ED8", emoji: "🏆", from: "Yaoundé", to: "Douala",     dep: "07:00", arr: "10:30", price: 3000,  seats: 4,  total: 70, class: "Standard", plate: "CE-1145-B", amenities: ["AC"], rating: 4.8 },
  { id: "B003", agency: "Vatican Express",     color: "#475569", emoji: "⚪", from: "Yaoundé", to: "Douala",     dep: "08:00", arr: "11:30", price: 3200,  seats: 22, total: 45, class: "Comfort",  plate: "LT-5567-C", amenities: ["AC","USB"], rating: 4.5 },
  { id: "B004", agency: "Touristique Express", color: "#16A34A", emoji: "🟢", from: "Yaoundé", to: "Douala",     dep: "08:00", arr: "11:30", price: 3800,  seats: 8,  total: 60, class: "VIP",      plate: "CE-2201-D", amenities: ["AC","WiFi","Snack"], rating: 4.7 },
  { id: "B005", agency: "Garanti Express",     color: "#DC2626", emoji: "🔴", from: "Yaoundé", to: "Douala",     dep: "10:00", arr: "13:30", price: 2800,  seats: 30, total: 40, class: "Standard", plate: "CE-8832-E", amenities: [], rating: 4.3 },
  { id: "B006", agency: "United Express",      color: "#0891B2", emoji: "🩵", from: "Yaoundé", to: "Douala",     dep: "14:00", arr: "17:30", price: 3500,  seats: 18, total: 60, class: "VIP",      plate: "LT-3301-F", amenities: ["AC","WiFi","USB"], rating: 4.7 },
  { id: "B007", agency: "Buca Voyage",         color: "#CA8A04", emoji: "🟡", from: "Yaoundé", to: "Douala",     dep: "19:00", arr: "22:30", price: 3200,  seats: 15, total: 55, class: "VIP",      plate: "CE-7743-G", amenities: ["AC","USB"], rating: 4.6 },
  { id: "B008", agency: "Général Express",     color: "#1D4ED8", emoji: "🏆", from: "Yaoundé", to: "Douala",     dep: "19:00", arr: "22:30", price: 3000,  seats: 0,  total: 70, class: "Standard", plate: "LT-6612-H", amenities: ["AC"], rating: 4.8 },

  // ── Douala ↔ Yaoundé ──────────────────────────────────────────────────────
  { id: "B009", agency: "United Express",      color: "#0891B2", emoji: "🩵", from: "Douala", to: "Yaoundé",     dep: "06:00", arr: "09:30", price: 3500,  seats: 10, total: 60, class: "VIP",      plate: "LT-9823-A", amenities: ["AC","WiFi","USB"], rating: 4.7 },
  { id: "B010", agency: "Vatican Express",     color: "#475569", emoji: "⚪", from: "Douala", to: "Yaoundé",     dep: "08:00", arr: "11:30", price: 3200,  seats: 28, total: 45, class: "Comfort",  plate: "LT-5567-C", amenities: ["AC","USB"], rating: 4.5 },
  { id: "B011", agency: "Général Express",     color: "#1D4ED8", emoji: "🏆", from: "Douala", to: "Yaoundé",     dep: "08:00", arr: "11:30", price: 3000,  seats: 5,  total: 70, class: "Standard", plate: "CE-1145-B", amenities: ["AC"], rating: 4.8 },
  { id: "B012", agency: "Garanti Express",     color: "#DC2626", emoji: "🔴", from: "Douala", to: "Yaoundé",     dep: "19:00", arr: "22:30", price: 2800,  seats: 20, total: 40, class: "Standard", plate: "CE-8832-E", amenities: [], rating: 4.3 },

  // ── Yaoundé ↔ Bamenda ─────────────────────────────────────────────────────
  { id: "B013", agency: "Amour Mezam",         color: "#9333EA", emoji: "💜", from: "Yaoundé", to: "Bamenda",    dep: "08:00", arr: "14:00", price: 6000,  seats: 20, total: 50, class: "VIP",      plate: "NW-4421-A", amenities: ["AC","WiFi","USB","Snack"], rating: 4.6 },
  { id: "B014", agency: "Nso Boys Agency",     color: "#7C3AED", emoji: "🟣", from: "Yaoundé", to: "Bamenda",    dep: "08:00", arr: "14:00", price: 5500,  seats: 12, total: 50, class: "Comfort",  plate: "NW-2201-B", amenities: ["AC","USB"], rating: 4.5 },
  { id: "B015", agency: "Vatican Express",     color: "#475569", emoji: "⚪", from: "Yaoundé", to: "Bamenda",    dep: "08:00", arr: "14:00", price: 5800,  seats: 6,  total: 45, class: "Comfort",  plate: "NW-8812-C", amenities: ["AC"], rating: 4.5 },
  { id: "B016", agency: "Moghamo Express",     color: "#92400E", emoji: "🟤", from: "Yaoundé", to: "Bamenda",    dep: "19:00", arr: "01:00", price: 5500,  seats: 25, total: 48, class: "Standard", plate: "NW-3301-D", amenities: ["AC"], rating: 4.4 },
  { id: "B017", agency: "Amour Mezam",         color: "#9333EA", emoji: "💜", from: "Yaoundé", to: "Bamenda",    dep: "19:00", arr: "01:00", price: 6000,  seats: 8,  total: 50, class: "VIP",      plate: "NW-5543-E", amenities: ["AC","WiFi","USB"], rating: 4.6 },

  // ── Bamenda ↔ Douala ──────────────────────────────────────────────────────
  { id: "B018", agency: "Nso Boys Agency",     color: "#7C3AED", emoji: "🟣", from: "Bamenda", to: "Douala",     dep: "08:00", arr: "14:00", price: 5500,  seats: 18, total: 50, class: "Comfort",  plate: "NW-2201-B", amenities: ["AC","USB"], rating: 4.5 },
  { id: "B019", agency: "Grand Jeannot",       color: "#EA580C", emoji: "🟠", from: "Bamenda", to: "Douala",     dep: "08:00", arr: "14:00", price: 5000,  seats: 30, total: 40, class: "Standard", plate: "NW-7712-F", amenities: [], rating: 4.3 },
  { id: "B020", agency: "Moghamo Express",     color: "#92400E", emoji: "🟤", from: "Bamenda", to: "Douala",     dep: "19:00", arr: "01:00", price: 5500,  seats: 10, total: 48, class: "Standard", plate: "NW-3301-D", amenities: ["AC"], rating: 4.4 },
  { id: "B021", agency: "The Peoples Agency",  color: "#DB2777", emoji: "🫶", from: "Bamenda", to: "Douala",     dep: "08:00", arr: "14:00", price: 4500,  seats: 22, total: 45, class: "Budget",   plate: "NW-9901-G", amenities: [], rating: 4.2 },

  // ── Douala ↔ Bafoussam ────────────────────────────────────────────────────
  { id: "B022", agency: "Buca Voyage",         color: "#CA8A04", emoji: "🟡", from: "Douala", to: "Bafoussam",   dep: "08:00", arr: "12:00", price: 4000,  seats: 24, total: 55, class: "VIP",      plate: "OU-2211-A", amenities: ["AC","USB"], rating: 4.6 },
  { id: "B023", agency: "Général Express",     color: "#1D4ED8", emoji: "🏆", from: "Douala", to: "Bafoussam",   dep: "08:00", arr: "12:00", price: 3500,  seats: 40, total: 70, class: "Standard", plate: "OU-5543-B", amenities: ["AC"], rating: 4.8 },
  { id: "B024", agency: "Musango Agency",      color: "#2563EB", emoji: "🔵", from: "Douala", to: "Bafoussam",   dep: "10:00", arr: "14:00", price: 4200,  seats: 12, total: 45, class: "Comfort",  plate: "OU-8821-C", amenities: ["AC","USB"], rating: 4.4 },
  { id: "B025", agency: "Buca Voyage",         color: "#CA8A04", emoji: "🟡", from: "Douala", to: "Bafoussam",   dep: "19:00", arr: "23:00", price: 4000,  seats: 8,  total: 55, class: "VIP",      plate: "OU-3312-D", amenities: ["AC","WiFi","USB"], rating: 4.6 },

  // ── Yaoundé ↔ Ngaoundéré ─────────────────────────────────────────────────
  { id: "B026", agency: "Touristique Express", color: "#16A34A", emoji: "🟢", from: "Yaoundé", to: "Ngaoundéré", dep: "08:00", arr: "17:00", price: 9000,  seats: 14, total: 60, class: "VIP",      plate: "AD-1121-A", amenities: ["AC","WiFi","Snack","USB"], rating: 4.7 },
  { id: "B027", agency: "Général Express",     color: "#1D4ED8", emoji: "🏆", from: "Yaoundé", to: "Ngaoundéré", dep: "08:00", arr: "17:00", price: 8000,  seats: 22, total: 70, class: "Standard", plate: "AD-4432-B", amenities: ["AC"], rating: 4.8 },
  { id: "B028", agency: "Touristique Express", color: "#16A34A", emoji: "🟢", from: "Yaoundé", to: "Ngaoundéré", dep: "19:00", arr: "04:00", price: 9000,  seats: 5,  total: 60, class: "VIP",      plate: "AD-7713-C", amenities: ["AC","WiFi","Snack"], rating: 4.7 },

  // ── Douala ↔ Lagos ────────────────────────────────────────────────────────
  { id: "B029", agency: "Afrique Con",         color: "#059669", emoji: "🌍", from: "Douala", to: "Lagos (Nigeria)", dep: "08:00", arr: "16:00", price: 15000, seats: 18, total: 50, class: "VIP",   plate: "LT-0012-INT", amenities: ["AC","WiFi","Passport Check","USB"], rating: 4.5 },
  { id: "B030", agency: "Afrique Con",         color: "#059669", emoji: "🌍", from: "Douala", to: "Lagos (Nigeria)", dep: "19:00", arr: "03:00", price: 15000, seats: 6,  total: 50, class: "VIP",   plate: "LT-0013-INT", amenities: ["AC","WiFi","Passport Check"], rating: 4.5 },

  // ── Douala ↔ Limbé ────────────────────────────────────────────────────────
  { id: "B031", agency: "Nso Boys Agency",     color: "#7C3AED", emoji: "🟣", from: "Douala", to: "Limbé",       dep: "07:00", arr: "08:30", price: 1500,  seats: 20, total: 50, class: "Comfort",  plate: "SW-2201-A", amenities: ["AC"], rating: 4.5 },
  { id: "B032", agency: "Grand Jeannot",       color: "#EA580C", emoji: "🟠", from: "Douala", to: "Limbé",       dep: "09:00", arr: "10:30", price: 1200,  seats: 35, total: 40, class: "Standard", plate: "SW-5512-B", amenities: [], rating: 4.3 },
  { id: "B033", agency: "Vatican Express",     color: "#475569", emoji: "⚪", from: "Douala", to: "Limbé",       dep: "11:00", arr: "12:30", price: 1400,  seats: 15, total: 45, class: "Comfort",  plate: "SW-8821-C", amenities: ["AC","USB"], rating: 4.5 },
  { id: "B034", agency: "Amour Mezam",         color: "#9333EA", emoji: "💜", from: "Douala", to: "Limbé",       dep: "14:00", arr: "15:30", price: 1500,  seats: 8,  total: 50, class: "VIP",      plate: "SW-1102-D", amenities: ["AC","USB"], rating: 4.6 },
  { id: "B035", agency: "Garanti Express",     color: "#DC2626", emoji: "🔴", from: "Douala", to: "Limbé",       dep: "16:00", arr: "17:30", price: 1100,  seats: 28, total: 40, class: "Standard", plate: "SW-4431-E", amenities: [], rating: 4.3 },
];

type SortKey = "price" | "time" | "seats" | "rating";
type FilterClass = "All" | "VIP" | "Comfort" | "Standard" | "Budget";

function getAvailableBuses(from: string, to: string, time: string) {
  return ALL_BUSES.filter(b => {
    const fromMatch = b.from.toLowerCase() === from.toLowerCase();
    const toMatch   = b.to.toLowerCase()   === to.toLowerCase();
    // time filter: if specific time given match dep hour, otherwise show all
    const timeMatch = !time || time === "—" || b.dep === time ||
      (time !== "08:00" && time !== "19:00"); // custom time → show all
    return fromMatch && toMatch && timeMatch;
  });
}

// ─── SEAT AVAILABILITY BAR ────────────────────────────────────────────────────
function SeatBar({ seats, total, color }: { seats: number; total: number; color: string }) {
  const pct = seats / total;
  const label = seats === 0 ? "Full" : seats <= 5 ? "Almost full" : `${seats} seats`;
  const barColor = seats === 0 ? RED : seats <= 5 ? GOLD : color;
  return (
    <View style={sb.wrap}>
      <View style={sb.track}>
        <View style={[sb.fill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[sb.label, { color: barColor }]}>{label}</Text>
    </View>
  );
}

const sb = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  track: { flex: 1, height: 5, borderRadius: 3, backgroundColor: "#EEE", overflow: "hidden" },
  fill: { height: 5, borderRadius: 3 },
  label: { fontSize: 10, fontWeight: "800", minWidth: 60, textAlign: "right" },
});

// ─── BUS CARD ─────────────────────────────────────────────────────────────────
function BusCard({ bus, onBook }: { bus: typeof ALL_BUSES[0]; onBook: (b: typeof ALL_BUSES[0]) => void }) {
  const isFull = bus.seats === 0;
  const isNight = parseInt(bus.dep.split(":")[0]) >= 18;

  return (
    <TouchableOpacity
      style={[bc.card, isFull && bc.cardFull]}
      onPress={() => !isFull && onBook(bus)}
      activeOpacity={isFull ? 1 : 0.8}
      disabled={isFull}
    >
      {/* Left accent */}
      <View style={[bc.accent, { backgroundColor: bus.color }]} />

      {/* Header row */}
      <View style={bc.header}>
        <View style={[bc.iconWrap, { backgroundColor: bus.color + "18" }]}>
          <Text style={{ fontSize: 22 }}>{bus.emoji}</Text>
        </View>
        <View style={bc.agencyBlock}>
          <Text style={bc.agencyName}>{bus.agency}</Text>
          <View style={bc.classBadge}>
            <Text style={[bc.classBadgeText, { color: bus.color }]}>{bus.class}</Text>
          </View>
        </View>
        <View style={bc.priceBlock}>
          <Text style={bc.price}>{bus.price.toLocaleString()}</Text>
          <Text style={bc.priceCur}>XAF</Text>
        </View>
      </View>

      {/* Time row */}
      <View style={bc.timeRow}>
        <View style={bc.timeBlock}>
          <Text style={bc.timeMain}>{bus.dep}</Text>
          <Text style={bc.timeLabel}>{isNight ? "🌙 Night" : "🌅 Day"}</Text>
        </View>
        <View style={bc.timeLine}>
          <View style={bc.timeLineDash} />
          <Text style={bc.busIcon}>🚌</Text>
          <View style={bc.timeLineDash} />
        </View>
        <View style={[bc.timeBlock, { alignItems: "flex-end" }]}>
          <Text style={bc.timeMain}>{bus.arr}</Text>
          <Text style={bc.timeLabel}>Arrives</Text>
        </View>
      </View>

      {/* Plate & amenities */}
      <View style={bc.bottomRow}>
        <Text style={bc.plate}>🪪 {bus.plate}</Text>
        <View style={bc.amenities}>
          {bus.amenities.map((a, i) => (
            <View key={i} style={bc.amenityChip}>
              <Text style={bc.amenityText}>{a}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Seats bar */}
      <SeatBar seats={bus.seats} total={bus.total} color={bus.color} />

      {/* Rating */}
      <View style={bc.footer}>
        <Text style={bc.rating}>⭐ {bus.rating}</Text>
        {isFull ? (
          <View style={bc.fullBadge}><Text style={bc.fullBadgeText}>FULLY BOOKED</Text></View>
        ) : (
          <TouchableOpacity style={[bc.bookBtn, { backgroundColor: bus.color }]} onPress={() => onBook(bus)}>
            <Text style={bc.bookBtnText}>Choose Seat →</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const bc = StyleSheet.create({
  card: {
    backgroundColor: CARD, borderRadius: 20, padding: 16, marginBottom: 14,
    overflow: "hidden", position: "relative",
    borderWidth: 1.5, borderColor: BORDER,
    shadowColor: "#4C1D95", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
  },
  cardFull: { opacity: 0.6 },
  accent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 14, marginLeft: 8 },
  iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 12 },
  agencyBlock: { flex: 1 },
  agencyName: { fontSize: 15, fontWeight: "800", color: TEXT_C },
  classBadge: { alignSelf: "flex-start", backgroundColor: "#F5F3FF", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  classBadgeText: { fontSize: 10, fontWeight: "800" },
  priceBlock: { alignItems: "flex-end" },
  price: { fontSize: 20, fontWeight: "900", color: TEXT_C, letterSpacing: -0.5 },
  priceCur: { fontSize: 10, color: MUTED, fontWeight: "700", textAlign: "right" },

  timeRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#FAFAFA", borderRadius: 14, padding: 12, marginBottom: 10 },
  timeBlock: { flex: 1 },
  timeMain: { fontSize: 22, fontWeight: "900", color: TEXT_C, letterSpacing: -0.5 },
  timeLabel: { fontSize: 10, color: MUTED, fontWeight: "600", marginTop: 2 },
  timeLine: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  timeLineDash: { flex: 1, height: 2, backgroundColor: BORDER, borderRadius: 1 },
  busIcon: { fontSize: 20 },

  bottomRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  plate: { fontSize: 11, color: MUTED, fontWeight: "600" },
  amenities: { flexDirection: "row", flexWrap: "wrap", gap: 4, flex: 1, justifyContent: "flex-end" },
  amenityChip: { backgroundColor: PURPLE_LIGHT, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  amenityText: { fontSize: 9, color: PURPLE, fontWeight: "700" },

  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  rating: { fontSize: 13, fontWeight: "700", color: GOLD },
  bookBtn: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  bookBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  fullBadge: { backgroundColor: "#FEE2E2", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  fullBadgeText: { color: RED, fontWeight: "900", fontSize: 11, letterSpacing: 0.5 },
});

// ─── BOOKING MODAL ────────────────────────────────────────────────────────────
function BookingModal({ bus, from, to, date, onClose }: {
  bus: typeof ALL_BUSES[0] | null;
  from: string; to: string; date: string;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"confirm" | "success">("confirm");
  const ref = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (bus) { setStep("confirm"); }
  }, [bus]);

  const confirm = () => {
    setStep("success");
    Animated.sequence([
      Animated.timing(ref, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  if (!bus) return null;

  const bookingRef = `CB-${Date.now().toString().slice(-6)}`;

  return (
    <Modal visible={!!bus} animationType="slide" transparent onRequestClose={onClose}>
      <View style={bm.overlay}>
        <View style={bm.sheet}>
          <View style={bm.handle} />

          {step === "confirm" && (
            <>
              <Text style={bm.title}>Confirm Booking</Text>

              {/* Route summary */}
              <View style={bm.routeBox}>
                <Text style={bm.routeText}>{from}</Text>
                <Text style={bm.routeArrow}>→</Text>
                <Text style={bm.routeText}>{to}</Text>
              </View>

              {/* Details */}
              <View style={bm.detailGrid}>
                {[
                  { label: "Agency", value: bus.agency },
                  { label: "Date", value: date || "Not set" },
                  { label: "Departure", value: bus.dep },
                  { label: "Arrival", value: bus.arr },
                  { label: "Class", value: bus.class },
                  { label: "Plate", value: bus.plate },
                ].map((item, i) => (
                  <View key={i} style={bm.detailItem}>
                    <Text style={bm.detailLabel}>{item.label}</Text>
                    <Text style={bm.detailValue}>{item.value}</Text>
                  </View>
                ))}
              </View>

              {/* Price */}
              <View style={bm.priceRow}>
                <Text style={bm.priceLabel}>Total</Text>
                <Text style={bm.priceValue}>{bus.price.toLocaleString()} XAF</Text>
              </View>

              <TouchableOpacity style={[bm.confirmBtn, { backgroundColor: bus.color }]} onPress={confirm} activeOpacity={0.85}>
                <Text style={bm.confirmBtnText}>✅  Confirm & Pay at Terminal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={bm.cancelBtn} onPress={onClose}>
                <Text style={bm.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "success" && (
            <View style={bm.successWrap}>
              <Text style={bm.successEmoji}>🎉</Text>
              <Text style={bm.successTitle}>Seat Reserved!</Text>
              <Text style={bm.successRef}>{bookingRef}</Text>
              <Text style={bm.successSub}>
                Show this reference at the {bus.agency} terminal at least 20 minutes before {bus.dep}.
              </Text>
              <View style={bm.successDetails}>
                <Text style={bm.successDetailItem}>🚌 {bus.agency}</Text>
                <Text style={bm.successDetailItem}>📅 {date || "Date not set"}</Text>
                <Text style={bm.successDetailItem}>⏰ Departure {bus.dep}</Text>
                <Text style={bm.successDetailItem}>🪪 {bus.plate}</Text>
              </View>
              <TouchableOpacity style={[bm.confirmBtn, { backgroundColor: bus.color }]} onPress={onClose}>
                <Text style={bm.confirmBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const bm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    maxHeight: "92%",
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "900", color: TEXT_C, marginBottom: 18, letterSpacing: -0.5 },

  routeBox: { flexDirection: "row", alignItems: "center", backgroundColor: PURPLE_LIGHT, borderRadius: 16, padding: 16, marginBottom: 18, gap: 10 },
  routeText: { flex: 1, fontSize: 16, fontWeight: "800", color: PURPLE_DARK, textAlign: "center" },
  routeArrow: { fontSize: 20, color: PURPLE, fontWeight: "900" },

  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  detailItem: { width: "47%", backgroundColor: "#FAFAFA", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: BORDER },
  detailLabel: { fontSize: 10, color: MUTED, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  detailValue: { fontSize: 13, color: TEXT_C, fontWeight: "700" },

  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: PURPLE_DARK, borderRadius: 16, padding: 16, marginBottom: 18 },
  priceLabel: { fontSize: 14, color: "#C4B5FD", fontWeight: "700" },
  priceValue: { fontSize: 24, color: "#fff", fontWeight: "900", letterSpacing: -0.5 },

  confirmBtn: { borderRadius: 18, paddingVertical: 17, alignItems: "center", marginBottom: 10 },
  confirmBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  cancelBtn: { backgroundColor: PURPLE_LIGHT, borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  cancelText: { color: PURPLE, fontWeight: "700", fontSize: 15 },

  successWrap: { alignItems: "center", paddingVertical: 10 },
  successEmoji: { fontSize: 64, marginBottom: 12 },
  successTitle: { fontSize: 28, fontWeight: "900", color: TEXT_C, letterSpacing: -0.8, marginBottom: 8 },
  successRef: { fontSize: 18, fontWeight: "800", color: PURPLE, marginBottom: 16, letterSpacing: 1 },
  successSub: { fontSize: 13, color: MUTED, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  successDetails: { backgroundColor: "#F5F3FF", borderRadius: 16, padding: 16, width: "100%", marginBottom: 24, gap: 8 },
  successDetailItem: { fontSize: 14, fontWeight: "600", color: TEXT_C },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function SearchResultsScreen() {
  const params = useLocalSearchParams<{ from: string; to: string; date: string; time: string }>();
  const router = useRouter();
  const { t } = useLang();

  const { from = "", to = "", date = "", time = "" } = params;

  const [sortBy, setSortBy] = useState<SortKey>("time");
  const [filterClass, setFilterClass] = useState<FilterClass>("All");
  const [selectedBus] = useState<typeof ALL_BUSES[0] | null>(null);

  const handleBookBus = (bus: typeof ALL_BUSES[0]) => {
    router.push({
      pathname: "/seat-selection",
      params: {
        busId: bus.id,
        agency: bus.agency,
        from,
        to,
        date,
        dep: bus.dep,
        arr: bus.arr,
        plate: bus.plate,
        busClass: bus.class,
        price: String(bus.price),
        color: bus.color.replace("#", "%23"),
        totalSeats: String(bus.total),
        takenSeats: String(bus.total - bus.seats),
        rating: String(bus.rating),
      },
    });
  };
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  const rawBuses = useMemo(() => getAvailableBuses(from, to, time), [from, to, time]);

  const filtered = useMemo(() => {
    let list = [...rawBuses];
    if (filterClass !== "All") list = list.filter(b => b.class === filterClass);
    if (showOnlyAvailable) list = list.filter(b => b.seats > 0);
    list.sort((a, b2) => {
      if (sortBy === "price")  return a.price - b2.price;
      if (sortBy === "seats")  return b2.seats - a.seats;
      if (sortBy === "rating") return b2.rating - a.rating;
      return a.dep.localeCompare(b2.dep);
    });
    return list;
  }, [rawBuses, sortBy, filterClass, showOnlyAvailable]);

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "time",   label: "⏰ Time" },
    { key: "price",  label: "💰 Price" },
    { key: "seats",  label: "💺 Seats" },
    { key: "rating", label: "⭐ Rating" },
  ];

  const CLASSES: FilterClass[] = ["All", "VIP", "Comfort", "Standard", "Budget"];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={PURPLE_DARK} />

      {/* Booking Modal */}
      <BookingModal bus={selectedBus} from={from} to={to} date={date} onClose={() => setSelectedBus(null)} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerRoute}>{from} → {to}</Text>
          <Text style={s.headerMeta}>{date || "Any date"} · {time || "Any time"}</Text>
        </View>
        <View style={{ width: 40 }} />
        <View style={s.hCircle1} />
        <View style={s.hCircle2} />
      </View>

      {/* Results count pill */}
      <View style={s.resultsPill}>
        <Text style={s.resultsPillText}>
          {filtered.length} bus{filtered.length !== 1 ? "es" : ""} found
        </Text>
        <TouchableOpacity
          style={[s.availToggle, showOnlyAvailable && s.availToggleOn]}
          onPress={() => setShowOnlyAvailable(v => !v)}
        >
          <Text style={[s.availToggleText, showOnlyAvailable && s.availToggleTextOn]}>
            Available only
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort & Filter */}
      <View style={s.controlsWrap}>
        <Text style={s.controlsLabel}>Sort</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[s.chip, sortBy === opt.key && s.chipActive]}
              onPress={() => setSortBy(opt.key)}
            >
              <Text style={[s.chipText, sortBy === opt.key && s.chipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={s.controlsWrap}>
        <Text style={s.controlsLabel}>Class</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips}>
          {CLASSES.map(cls => (
            <TouchableOpacity
              key={cls}
              style={[s.chip, filterClass === cls && s.chipActive]}
              onPress={() => setFilterClass(cls)}
            >
              <Text style={[s.chipText, filterClass === cls && s.chipTextActive]}>{cls}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bus List */}
      <ScrollView style={s.list} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🚌</Text>
            <Text style={s.emptyTitle}>No buses found</Text>
            <Text style={s.emptySub}>
              Try adjusting your filters or check another date.{"\n"}
              Route: {from} → {to}
            </Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => router.back()}>
              <Text style={s.emptyBtnText}>← Change Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map(bus => (
            <BusCard key={bus.id} bus={bus} onBook={b => handleBookBus(b)} />
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: {
    backgroundColor: PURPLE_DARK,
    paddingTop: Platform.OS === "android" ? 48 : 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 20, color: "#fff", fontWeight: "900" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerRoute: { fontSize: 18, fontWeight: "900", color: "#fff", letterSpacing: -0.4 },
  headerMeta: { fontSize: 12, color: "#C4B5FD", fontWeight: "500", marginTop: 2 },
  hCircle1: { position: "absolute", width: 160, height: 160, borderRadius: 80, backgroundColor: "#7C3AED", opacity: 0.2, right: -40, bottom: -60 },
  hCircle2: { position: "absolute", width: 90, height: 90, borderRadius: 45, backgroundColor: "#A78BFA", opacity: 0.12, right: 60, bottom: -20 },

  resultsPill: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 16, marginTop: 14, marginBottom: 4,
  },
  resultsPillText: { fontSize: 14, fontWeight: "800", color: TEXT_C },
  availToggle: { backgroundColor: "#F5F3FF", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1.5, borderColor: BORDER },
  availToggleOn: { backgroundColor: PURPLE_DARK, borderColor: PURPLE_DARK },
  availToggleText: { fontSize: 12, fontWeight: "700", color: MUTED },
  availToggleTextOn: { color: "#fff" },

  controlsWrap: { flexDirection: "row", alignItems: "center", paddingLeft: 16, marginBottom: 4 },
  controlsLabel: { fontSize: 11, fontWeight: "800", color: MUTED, width: 36, textTransform: "uppercase", letterSpacing: 0.5 },
  chips: { flex: 1, paddingVertical: 6 },
  chip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, backgroundColor: "#F0EBFF", borderWidth: 1.5, borderColor: BORDER },
  chipActive: { backgroundColor: PURPLE_DARK, borderColor: PURPLE_DARK },
  chipText: { fontSize: 12, fontWeight: "700", color: MUTED },
  chipTextActive: { color: "#fff" },

  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 10 },

  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: "900", color: TEXT_C, marginBottom: 8 },
  emptySub: { fontSize: 14, color: MUTED, textAlign: "center", lineHeight: 22, marginBottom: 24 },
  emptyBtn: { backgroundColor: PURPLE_DARK, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14 },
  emptyBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});