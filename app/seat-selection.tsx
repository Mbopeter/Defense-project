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

// ─── COLOURS ─────────────────────────────────────────────────────────────────
const PURPLE_DARK = "#4C1D95";
const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#EDE9FE";
const GOLD = "#F59E0B";
const GREEN = "#16A34A";
const RED = "#DC2626";
const BG = "#F5F3FF";
const CARD = "#FFFFFF";
const TEXT_C = "#1E1B4B";
const MUTED = "#6B7280";
const BORDER = "#DDD6FE";

// ─── SEAT LAYOUT GENERATOR ───────────────────────────────────────────────────
// Generates a deterministic "taken" pattern based on bus id + seat count
function generateSeatMap(busId: string, totalSeats: number, takenCount: number) {
  // Use busId as a seed for consistent taken seats per bus
  const seed = busId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const taken = new Set<number>();

  // Driver seat is always row 0 (not selectable)
  // Seats are numbered 1..totalSeats
const actualTaken = Math.min(takenCount, totalSeats);
const allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);
for (let i = allSeats.length - 1; i > 0; i--) {
  const j = ((seed * (i + 7) * 31) % (i + 1) + (i + 1)) % (i + 1);
  [allSeats[i], allSeats[j]] = [allSeats[j], allSeats[i]];
}
return new Set(allSeats.slice(0, actualTaken));
  return taken;
}

// Seat layout: 70 seats → 18 rows of 4 seats (A B _ C D) + 2 back bench seats
// Row layout: [A, B, aisle, C, D]
function buildRows(totalSeats: number) {
  // Standard layout: rows of 4 except last row of 5
  const rows: { rowNum: number; seats: (number | null)[] }[] = [];
  let seatNum = 1;

  // Row 1: driver row (special)
  // Rows 2..N: 4-seat rows (2+2)
  // Last row: 5-seat bench

  const backBenchCount = totalSeats >= 9 ? 5 : totalSeats;
  const regularSeatCount = totalSeats - backBenchCount;
  const regularRows = Math.ceil(regularSeatCount / 4);
// e.g. 40 seats → 35/4 = 9 rows × 4 = 35 + 5 bench = 40 ✓
  const hasBackBench = totalSeats >= 5;

  for (let r = 1; r <= regularRows; r++) {
    const row = {
      rowNum: r,
      seats: [seatNum, seatNum + 1, null, seatNum + 2, seatNum + 3] as (number | null)[],
    };
    seatNum += 4;
    rows.push(row);
  }

  // Back bench (last row — 5 seats across)
  if (hasBackBench && seatNum <= totalSeats) {
    const backSeats: (number | null)[] = [];
    for (let b = 0; b < 5 && seatNum <= totalSeats; b++) {
      backSeats.push(seatNum++);
    }
    rows.push({ rowNum: regularRows + 1, seats: backSeats });
  }

  return rows;
}

// ─── SEAT BUTTON ─────────────────────────────────────────────────────────────
function SeatButton({
  seatNum,
  status,
  selected,
  onPress,
  color,
}: {
  seatNum: number | null;
  status: "available" | "taken" | "selected";
  selected: boolean;
  onPress: () => void;
  color: string;
}) {
  if (seatNum === null) {
    // aisle spacer
    return <View style={sb.aisle} />;
  }

  const bg =
    status === "taken"
      ? "#E5E7EB"
      : status === "selected"
      ? color
      : CARD;

  const borderColor =
    status === "taken"
      ? "#D1D5DB"
      : status === "selected"
      ? color
      : BORDER;

  const textColor =
    status === "taken"
      ? "#9CA3AF"
      : status === "selected"
      ? "#fff"
      : TEXT_C;

  return (
    <TouchableOpacity
      style={[sb.seat, { backgroundColor: bg, borderColor }]}
      onPress={onPress}
      disabled={status === "taken"}
      activeOpacity={0.7}
    >
      {status === "taken" ? (
        <Text style={[sb.seatIcon]}>✕</Text>
      ) : status === "selected" ? (
        <Text style={[sb.seatIcon, { color: "#fff" }]}>✓</Text>
      ) : (
        <Text style={[sb.seatNum, { color: textColor }]}>{seatNum}</Text>
      )}
    </TouchableOpacity>
  );
}

const sb = StyleSheet.create({
  seat: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  seatNum: { fontSize: 12, fontWeight: "800" },
  seatIcon: { fontSize: 14, fontWeight: "900", color: "#9CA3AF" },
  aisle: { width: 20 },
});

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({
  visible,
  seatNums,
  busId,
  agency,
  from,
  to,
  date,
  dep,
  arr,
  plate,
  busClass,
  price,
  color,
  onClose,
}: {
  visible: boolean;
  seatNums: number[];
  busId: string;
  agency: string;
  from: string;
  to: string;
  date: string;
  dep: string;
  arr: string;
  plate: string;
  busClass: string;
  price: number;
  color: string;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"confirm" | "success">("confirm");
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const bookingRef = `CB-${busId}-${seatNums.join("-")}`;

  React.useEffect(() => {
    if (visible) {
      setStep("confirm");
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleConfirm = () => {
    setStep("success");
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={cm.overlay}>
        <View style={cm.sheet}>
          <View style={cm.handle} />

          {step === "confirm" && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={cm.title}>Confirm Your Seats</Text>

              {/* Route */}
              <View style={[cm.routeBox, { backgroundColor: color + "18", borderColor: color + "40" }]}>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={cm.routeCity}>{from}</Text>
                  <Text style={[cm.routeTime, { color }]}>{dep}</Text>
                </View>
                <Text style={[cm.routeArrow, { color }]}>✈ →</Text>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={cm.routeCity}>{to}</Text>
                  <Text style={[cm.routeTime, { color }]}>{arr}</Text>
                </View>
              </View>

              {/* Selected seats */}
              <Text style={cm.sectionLabel}>Selected Seats</Text>
              <View style={cm.seatsRow}>
                {seatNums.map(s => (
                  <View key={s} style={[cm.seatBadge, { backgroundColor: color }]}>
                    <Text style={cm.seatBadgeText}>💺 {s}</Text>
                  </View>
                ))}
              </View>

              {/* Trip details */}
              <View style={cm.detailGrid}>
                {[
                  { label: "Agency", value: agency },
                  { label: "Date", value: date || "Not set" },
                  { label: "Class", value: busClass },
                  { label: "Plate No.", value: plate },
                ].map((item, i) => (
                  <View key={i} style={cm.detailItem}>
                    <Text style={cm.detailLabel}>{item.label}</Text>
                    <Text style={cm.detailValue}>{item.value}</Text>
                  </View>
                ))}
              </View>

              {/* Price */}
              <View style={[cm.priceRow, { backgroundColor: color }]}>
                <View>
                  <Text style={cm.priceLabelTop}>
                    {seatNums.length} seat{seatNums.length > 1 ? "s" : ""} × {price.toLocaleString()} XAF
                  </Text>
                  <Text style={cm.priceLabelSub}>Total payable at terminal</Text>
                </View>
                <Text style={cm.priceValue}>
                  {(price * seatNums.length).toLocaleString()} XAF
                </Text>
              </View>

              <TouchableOpacity style={[cm.confirmBtn, { backgroundColor: color }]} onPress={handleConfirm} activeOpacity={0.85}>
                <Text style={cm.confirmBtnText}>✅  Reserve Seats</Text>
              </TouchableOpacity>
              <TouchableOpacity style={cm.cancelBtn} onPress={onClose}>
                <Text style={cm.cancelText}>← Change Selection</Text>
              </TouchableOpacity>
              <View style={{ height: 12 }} />
            </ScrollView>
          )}

          {step === "success" && (
            <Animated.View style={[cm.successWrap, { opacity: fadeAnim }]}>
              <Text style={cm.successEmoji}>🎉</Text>
              <Text style={cm.successTitle}>Seats Reserved!</Text>
              <Text style={[cm.successRef, { color }]}>{bookingRef}</Text>
              <Text style={cm.successSub}>
                Show this reference at the {agency} terminal at least 20 min before {dep}.
              </Text>

              <View style={cm.successCard}>
                <View style={cm.successSeatsRow}>
                  {seatNums.map(s => (
                    <View key={s} style={[cm.successSeatBadge, { backgroundColor: color + "20", borderColor: color + "50" }]}>
                      <Text style={[cm.successSeatText, { color }]}>💺 Seat {s}</Text>
                    </View>
                  ))}
                </View>
                <View style={{ gap: 8, marginTop: 10 }}>
                  <Text style={cm.successDetailItem}>🚌 {agency} — {busClass}</Text>
                  <Text style={cm.successDetailItem}>🛣️ {from} → {to}</Text>
                  <Text style={cm.successDetailItem}>📅 {date || "Date not set"}</Text>
                  <Text style={cm.successDetailItem}>⏰ Departs {dep} · Arrives {arr}</Text>
                  <Text style={cm.successDetailItem}>🪪 {plate}</Text>
                  <Text style={[cm.successDetailItem, { color, fontWeight: "800" }]}>
                    💰 {(price * seatNums.length).toLocaleString()} XAF total
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={[cm.confirmBtn, { backgroundColor: color }]} onPress={onClose}>
                <Text style={cm.confirmBtnText}>Done 🚌</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </Animated.View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const cm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 22, paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 8 : 4,
    maxHeight: "93%",
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 18 },
  title: { fontSize: 24, fontWeight: "900", color: TEXT_C, marginBottom: 16, letterSpacing: -0.5 },

  routeBox: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1.5 },
  routeCity: { fontSize: 16, fontWeight: "900", color: TEXT_C },
  routeTime: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  routeArrow: { fontSize: 18, fontWeight: "900", marginHorizontal: 8 },

  sectionLabel: { fontSize: 12, fontWeight: "800", color: MUTED, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 },
  seatsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  seatBadge: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  seatBadgeText: { color: "#fff", fontWeight: "800", fontSize: 13 },

  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  detailItem: { width: "47%", backgroundColor: "#FAFAFA", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: BORDER },
  detailLabel: { fontSize: 10, color: MUTED, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  detailValue: { fontSize: 13, color: TEXT_C, fontWeight: "700" },

  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 16, padding: 16, marginBottom: 16 },
  priceLabelTop: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  priceLabelSub: { fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: "500", marginTop: 2 },
  priceValue: { fontSize: 22, color: "#fff", fontWeight: "900", letterSpacing: -0.5 },

  confirmBtn: { borderRadius: 18, paddingVertical: 17, alignItems: "center", marginBottom: 10 },
  confirmBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  cancelBtn: { backgroundColor: PURPLE_LIGHT, borderRadius: 16, paddingVertical: 14, alignItems: "center", marginBottom: 4 },
  cancelText: { color: PURPLE, fontWeight: "700", fontSize: 15 },

  successWrap: { alignItems: "center", paddingTop: 10, paddingBottom: 10 },
  successEmoji: { fontSize: 60, marginBottom: 10 },
  successTitle: { fontSize: 28, fontWeight: "900", color: TEXT_C, letterSpacing: -0.8, marginBottom: 8 },
  successRef: { fontSize: 15, fontWeight: "800", marginBottom: 14, letterSpacing: 0.5, textAlign: "center" },
  successSub: { fontSize: 13, color: MUTED, textAlign: "center", lineHeight: 20, marginBottom: 16, paddingHorizontal: 10 },
  successCard: { backgroundColor: "#F5F3FF", borderRadius: 18, padding: 16, width: "100%", marginBottom: 20 },
  successSeatsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  successSeatBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1.5 },
  successSeatText: { fontWeight: "800", fontSize: 13 },
  successDetailItem: { fontSize: 13, fontWeight: "600", color: TEXT_C },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function SeatSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    busId: string; agency: string; from: string; to: string;
    date: string; dep: string; arr: string; plate: string;
    busClass: string; price: string; color: string; totalSeats: string; takenSeats: string;
    rating: string;
  }>();

  const {
    busId = "B001", agency = "Agency", from = "City A", to = "City B",
    date = "", dep = "08:00", arr = "12:00", plate = "XX-0000-X",
    busClass = "Standard", price = "3000", color = "#4C1D95",
    totalSeats = "70", takenSeats = "48", rating = "4.5",
  } = params;

  const total = parseInt(totalSeats, 10) || 70;
  const takenCount = parseInt(takenSeats, 10) || 48;
  const priceNum = parseInt(price, 10) || 3000;
  const busColor = color.startsWith("%23") ? "#" + color.slice(3) : color;

  const takenSet = useMemo(
    () => generateSeatMap(busId, total, takenCount),
    [busId, total, takenCount]
  );

  const rows = useMemo(() => buildRows(total), [total]);

  const [selectedSeats, setSelectedSeats] = useState<Set<number>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);

  const availableCount = total - takenCount;

  const toggleSeat = (seatNum: number) => {
    setSelectedSeats(prev => {
      const next = new Set(prev);
      if (next.has(seatNum)) {
        next.delete(seatNum);
      } else {
        if (next.size >= 5) return prev; // max 5 seats per booking
        next.add(seatNum);
      }
      return next;
    });
  };

  const getSeatStatus = (seatNum: number): "available" | "taken" | "selected" => {
    if (selectedSeats.has(seatNum)) return "selected";
    if (takenSet.has(seatNum)) return "taken";
    return "available";
  };

  const isBackBenchRow = (row: { seats: (number | null)[] }) => row.seats.length === 5;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={PURPLE_DARK} />

      <ConfirmModal
        visible={showConfirm}
        seatNums={Array.from(selectedSeats).sort((a, b) => a - b)}
        busId={busId}
        agency={agency}
        from={from}
        to={to}
        date={date}
        dep={dep}
        arr={arr}
        plate={plate}
        busClass={busClass}
        price={priceNum}
        color={busColor}
       onClose={(booked?: boolean) => {
       setShowConfirm(false);
       if (booked) {
       setSelectedSeats(new Set());
       router.replace("/(tabs)");
  }
}}
      />

      {/* ── HEADER ── */}
      <View style={[s.header, { backgroundColor: PURPLE_DARK }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Select Your Seat</Text>
          <Text style={s.headerSub}>{agency} · {from} → {to}</Text>
        </View>
        <View style={{ width: 40 }} />
        <View style={s.hCircle1} />
        <View style={s.hCircle2} />
      </View>

      {/* ── TRIP SUMMARY STRIP ── */}
      <View style={[s.tripStrip, { borderColor: busColor + "40", backgroundColor: busColor + "0D" }]}>
        <View style={s.tripBlock}>
          <Text style={s.tripValue}>{dep}</Text>
          <Text style={s.tripLabel}>{from}</Text>
        </View>
        <View style={s.tripMid}>
          <Text style={{ fontSize: 11, color: MUTED, fontWeight: "700" }}>{busClass}</Text>
          <Text style={[s.tripArrow, { color: busColor }]}>🚌 ──→</Text>
          <Text style={{ fontSize: 10, color: MUTED }}>{plate}</Text>
        </View>
        <View style={[s.tripBlock, { alignItems: "flex-end" }]}>
          <Text style={s.tripValue}>{arr}</Text>
          <Text style={s.tripLabel}>{to}</Text>
        </View>
      </View>

      {/* ── LEGEND ── */}
      <View style={s.legend}>
        <View style={s.legendItem}>
          <View style={[s.legendBox, { backgroundColor: CARD, borderColor: BORDER }]} />
          <Text style={s.legendText}>Available ({availableCount})</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendBox, { backgroundColor: "#E5E7EB", borderColor: "#D1D5DB" }]}>
            <Text style={{ fontSize: 7, color: "#9CA3AF", fontWeight: "900" }}>✕</Text>
          </View>
          <Text style={s.legendText}>Taken ({takenCount})</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendBox, { backgroundColor: busColor, borderColor: busColor }]}>
            <Text style={{ fontSize: 7, color: "#fff", fontWeight: "900" }}>✓</Text>
          </View>
          <Text style={s.legendText}>Your pick ({selectedSeats.size})</Text>
        </View>
        <View style={s.legendItem}>
          <Text style={s.ratingText}>⭐ {rating}</Text>
        </View>
      </View>

      {/* ── BUS BODY ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bus outline */}
        <View style={s.busBody}>
          {/* Windscreen / Front */}
          <View style={s.busFront}>
            <View style={s.windscreen}>
              <Text style={s.windscreenText}>🚌  Front</Text>
            </View>
            <View style={s.driverArea}>
              <Text style={s.driverIcon}>👨‍✈️</Text>
              <Text style={s.driverLabel}>Driver</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* Seat rows */}
          <View style={s.rowsWrap}>
            {rows.map((row, ri) => {
              const isBack = isBackBenchRow(row);
              return (
                <View key={ri} style={[s.row, isBack && s.backRow]}>
                  {/* Row number */}
                  <Text style={s.rowNum}>{row.rowNum}</Text>

                  {isBack ? (
                    // Back bench: 5 seats across
                    <View style={s.backBenchWrap}>
                      {row.seats.map((seatNum, si) =>
                        seatNum !== null ? (
                          <SeatButton
                            key={si}
                            seatNum={seatNum}
                            status={getSeatStatus(seatNum)}
                            selected={selectedSeats.has(seatNum)}
                            onPress={() => toggleSeat(seatNum)}
                            color={busColor}
                          />
                        ) : null
                      )}
                    </View>
                  ) : (
                    // Normal row: A B | aisle | C D
                    <View style={s.seatRow}>
                      <SeatButton
                        seatNum={row.seats[0]}
                        status={row.seats[0] !== null ? getSeatStatus(row.seats[0]) : "available"}
                        selected={row.seats[0] !== null && selectedSeats.has(row.seats[0])}
                        onPress={() => row.seats[0] !== null && toggleSeat(row.seats[0])}
                        color={busColor}
                      />
                      <SeatButton
                        seatNum={row.seats[1]}
                        status={row.seats[1] !== null ? getSeatStatus(row.seats[1]) : "available"}
                        selected={row.seats[1] !== null && selectedSeats.has(row.seats[1])}
                        onPress={() => row.seats[1] !== null && toggleSeat(row.seats[1])}
                        color={busColor}
                      />
                      {/* Aisle */}
                      <View style={s.aisle}>
                        <Text style={s.aisleText}>{row.rowNum}</Text>
                      </View>
                      <SeatButton
                        seatNum={row.seats[3]}
                        status={row.seats[3] !== null ? getSeatStatus(row.seats[3]) : "available"}
                        selected={row.seats[3] !== null && selectedSeats.has(row.seats[3])}
                        onPress={() => row.seats[3] !== null && toggleSeat(row.seats[3])}
                        color={busColor}
                      />
                      <SeatButton
                        seatNum={row.seats[4]}
                        status={row.seats[4] !== null ? getSeatStatus(row.seats[4]) : "available"}
                        selected={row.seats[4] !== null && selectedSeats.has(row.seats[4])}
                        onPress={() => row.seats[4] !== null && toggleSeat(row.seats[4])}
                        color={busColor}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Rear */}
          <View style={s.busRear}>
            <Text style={s.busRearText}>🔚  Rear</Text>
          </View>
        </View>

        {/* Capacity info */}
        <View style={s.capacityBar}>
          <View style={[s.capacityFill, { width: `${(takenCount / total) * 100}%`, backgroundColor: takenCount / total > 0.8 ? RED : busColor }]} />
        </View>
        <Text style={s.capacityLabel}>
          {takenCount} of {total} seats occupied · {availableCount} available
        </Text>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── BOTTOM ACTION BAR ── */}
      <View style={s.bottomBar}>
        <View style={s.bottomInfo}>
          {selectedSeats.size === 0 ? (
            <Text style={s.bottomHint}>Tap a seat to select it</Text>
          ) : (
            <>
              <Text style={s.bottomSeatsLabel}>
                {selectedSeats.size} seat{selectedSeats.size > 1 ? "s" : ""} selected
              </Text>
              <Text style={s.bottomPrice}>
                {(priceNum * selectedSeats.size).toLocaleString()} XAF
              </Text>
            </>
          )}
        </View>
        <TouchableOpacity
          style={[s.bookBtn, { backgroundColor: selectedSeats.size > 0 ? busColor : "#D1D5DB" }]}
          onPress={() => selectedSeats.size > 0 && setShowConfirm(true)}
          activeOpacity={0.85}
        >
          <Text style={s.bookBtnText}>
            {selectedSeats.size > 0 ? `Book ${selectedSeats.size} Seat${selectedSeats.size > 1 ? "s" : ""} →` : "Select a Seat"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: {
    paddingTop: Platform.OS === "android" ? 48 : 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 20, color: "#fff", fontWeight: "900" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#fff", letterSpacing: -0.4 },
  headerSub: { fontSize: 11, color: "#C4B5FD", fontWeight: "500", marginTop: 2 },
  hCircle1: { position: "absolute", width: 160, height: 160, borderRadius: 80, backgroundColor: "#7C3AED", opacity: 0.2, right: -40, bottom: -60 },
  hCircle2: { position: "absolute", width: 90, height: 90, borderRadius: 45, backgroundColor: "#A78BFA", opacity: 0.12, right: 60, bottom: -20 },

  tripStrip: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, marginTop: 12, marginBottom: 6,
    borderRadius: 16, padding: 14, borderWidth: 1.5,
  },
  tripBlock: { flex: 1 },
  tripValue: { fontSize: 18, fontWeight: "900", color: TEXT_C, letterSpacing: -0.5 },
  tripLabel: { fontSize: 11, color: MUTED, fontWeight: "600", marginTop: 2 },
  tripMid: { flex: 1.2, alignItems: "center", gap: 2 },
  tripArrow: { fontSize: 16, fontWeight: "900" },

  legend: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, marginBottom: 10, gap: 14, flexWrap: "wrap",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  legendText: { fontSize: 11, color: TEXT_C, fontWeight: "600" },
  ratingText: { fontSize: 12, fontWeight: "700", color: GOLD },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  busBody: {
    backgroundColor: CARD,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: BORDER,
    overflow: "hidden",
    shadowColor: PURPLE_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },

  busFront: {
    backgroundColor: PURPLE_DARK,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  windscreen: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    marginRight: 12,
  },
  windscreenText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  driverArea: { alignItems: "center" },
  driverIcon: { fontSize: 28 },
  driverLabel: { fontSize: 10, color: "#C4B5FD", fontWeight: "700", marginTop: 2 },

  divider: { height: 3, backgroundColor: BORDER },

  rowsWrap: { paddingVertical: 12, paddingHorizontal: 10, gap: 8 },

  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  backRow: { justifyContent: "center", marginTop: 4 },

  rowNum: { fontSize: 10, color: MUTED, fontWeight: "800", width: 18, textAlign: "center" },

  seatRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },

  aisle: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  aisleText: { fontSize: 9, color: "#D1D5DB", fontWeight: "700" },

  backBenchWrap: { flexDirection: "row", gap: 8, justifyContent: "center", flex: 1 },

  busRear: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    alignItems: "center",
    borderTopWidth: 2,
    borderTopColor: BORDER,
  },
  busRearText: { fontSize: 12, color: MUTED, fontWeight: "700" },

  capacityBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginTop: 14,
    overflow: "hidden",
  },
  capacityFill: { height: 6, borderRadius: 3 },
  capacityLabel: { fontSize: 11, color: MUTED, fontWeight: "600", textAlign: "center", marginTop: 6, marginBottom: 4 },

  bottomBar: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 36 : 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderTopWidth: 1.5,
    borderTopColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  bottomInfo: { flex: 1 },
  bottomHint: { fontSize: 14, color: MUTED, fontWeight: "600" },
  bottomSeatsLabel: { fontSize: 12, color: MUTED, fontWeight: "600" },
  bottomPrice: { fontSize: 22, fontWeight: "900", color: TEXT_C, letterSpacing: -0.5, marginTop: 2 },
  bookBtn: { borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14 },
  bookBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});