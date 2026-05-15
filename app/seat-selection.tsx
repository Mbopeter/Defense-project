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

// ─── NAMED SEAT LAYOUT ───────────────────────────────────────────────────────
//
//  Front bench : P1, P2
//  Row 1  left : Driver seat only (not bookable)
//  Row 1  right: B1, B2
//  Row 2  left : A1, A2, A3  |  RIGHT: DOOR (no B seats)
//  Rows 3-13 left : A4-A36   (3 per row)
//  Rows 3-13 right: B3-B26   (2 per row)
//  Back bench  : C1-C7       (7 seats)
//  Total bookable: 2 + 36 + 26 + 7 = 71

const FRONT_BENCH = ["P1", "P2"];
const BACK_BENCH  = ["C1", "C2", "C3", "C4", "C5", "C6", "C7"];
const LEFT_SEATS  = Array.from({ length: 36 }, (_, i) => `A${i + 1}`);
const RIGHT_SEATS = Array.from({ length: 26 }, (_, i) => `B${i + 1}`);
const ALL_SEAT_IDS = [...FRONT_BENCH, ...LEFT_SEATS, ...RIGHT_SEATS, ...BACK_BENCH];

interface BusRow {
  rowNum: number;
  isDriverRow: boolean;
  isDoorRow: boolean;
  leftSeats: string[];
  rightSeats: string[];
}

function buildSeatLayout(): BusRow[] {
  return Array.from({ length: 13 }, (_, i) => {
    const r = i + 1;
    const ai = (r - 2) * 3 + 1;
    const bi = (r - 1) * 2 + 1;
    return {
      rowNum: r,
      isDriverRow: r === 1,
      isDoorRow: r === 2,
      leftSeats:  r === 1 ? [] : [`A${ai}`, `A${ai + 1}`, `A${ai + 2}`],
      rightSeats: r === 2 ? [] : [`B${bi}`, `B${bi + 1}`],
    };
  });
}

// Deterministic Fisher-Yates shuffle over named seat IDs
function generateSeatMap(busId: string, takenCount: number): Set<string> {
  const seed = busId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const seats = [...ALL_SEAT_IDS];
  for (let i = seats.length - 1; i > 0; i--) {
    const j = ((seed * (i + 7) * 31) % (i + 1) + (i + 1)) % (i + 1);
    [seats[i], seats[j]] = [seats[j], seats[i]];
  }
  return new Set(seats.slice(0, Math.min(takenCount, seats.length)));
}

// ─── SEAT BUTTON ─────────────────────────────────────────────────────────────
function SeatButton({
  seatId,
  status,
  onPress,
  color,
  wide = false,
}: {
  seatId: string;
  status: "available" | "taken" | "selected";
  onPress: () => void;
  color: string;
  wide?: boolean;
}) {
  const bg =
    status === "taken"    ? "#E5E7EB" :
    status === "selected" ? color     : CARD;

  const borderColor =
    status === "taken"    ? "#D1D5DB" :
    status === "selected" ? color     : BORDER;

  const textColor =
    status === "taken"    ? "#9CA3AF" :
    status === "selected" ? "#fff"    : TEXT_C;

  return (
    <TouchableOpacity
      style={[sb.seat, { backgroundColor: bg, borderColor, width: wide ? 50 : 42 }]}
      onPress={onPress}
      disabled={status === "taken"}
      activeOpacity={status === "taken" ? 1 : 0.7}
      accessibilityState={{ disabled: status === "taken", selected: status === "selected" }}
    >
      {status === "taken" ? (
        <Text style={sb.seatIcon}>✕</Text>
      ) : status === "selected" ? (
        <Text style={[sb.seatIcon, { color: "#fff" }]}>✓</Text>
      ) : (
        <Text style={[sb.seatId, { color: textColor }]}>{seatId}</Text>
      )}
    </TouchableOpacity>
  );
}

// Non-interactive driver placeholder
function DriverSeat() {
  return (
    <View style={sb.driverSeat}>
      <Text style={sb.driverIcon}>👨‍✈️</Text>
    </View>
  );
}

const sb = StyleSheet.create({
  seat: {
    height: 42,
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
  seatId:   { fontSize: 9,  fontWeight: "800", textAlign: "center" },
  seatIcon: { fontSize: 13, fontWeight: "900", color: "#9CA3AF" },
  driverSeat: {
    width: 42, height: 42, borderRadius: 10,
    borderWidth: 2, borderColor: "#5B3A9E",
    backgroundColor: "#3C1A7A",
    alignItems: "center", justifyContent: "center",
  },
  driverIcon: { fontSize: 18 },
  aisle: { width: 20 },
});

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({
  visible,
  seatIds,
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
  seatIds: string[];
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
  onClose: (booked?: boolean) => void;
}) {
  const [step, setStep] = useState<"confirm" | "success">("confirm");
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const bookingRef = React.useRef(`CB-${busId}-${Date.now().toString().slice(-6)}`).current;

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
                {seatIds.map(s => (
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
                    {seatIds.length} seat{seatIds.length > 1 ? "s" : ""} × {price.toLocaleString()} XAF
                  </Text>
                  <Text style={cm.priceLabelSub}>Total payable at terminal</Text>
                </View>
                <Text style={cm.priceValue}>
                  {(price * seatIds.length).toLocaleString()} XAF
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
                  {seatIds.map(s => (
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
                    💰 {(price * seatIds.length).toLocaleString()} XAF total
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

  const total = parseInt(totalSeats, 10) || 71;
  const takenCount = parseInt(takenSeats, 10) || 20;
  const priceNum = parseInt(price, 10) || 3000;
  const busColor = color.startsWith("%23") ? "#" + color.slice(3) : color;

  const takenSet = useMemo(
    () => generateSeatMap(busId, takenCount),
    [busId, takenCount]
  );

  const rows = useMemo(() => buildSeatLayout(), []);

  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);

  const totalBookable  = ALL_SEAT_IDS.length;                            // 71
  const availableCount = totalBookable - takenSet.size - selectedSeats.size;

  const toggleSeat = (seatId: string) => {
    // Hard guard: never allow selecting a taken seat
    if (takenSet.has(seatId)) return;
    setSelectedSeats(prev => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        if (next.size >= 5) return prev; // max 5 seats per booking
        next.add(seatId);
      }
      return next;
    });
  };

  // Priority: taken > selected > available  (taken always wins)
  const getSeatStatus = (seatId: string): "available" | "taken" | "selected" => {
    if (takenSet.has(seatId))      return "taken";    // checked FIRST
    if (selectedSeats.has(seatId)) return "selected";
    return "available";
  };

  // Sort selected seats in reading order: P → A → B → C
  const selectedSorted = useMemo(() => {
    const order = (id: string) => {
      if (id.startsWith("P")) return parseInt(id.slice(1));
      if (id.startsWith("A")) return 100 + parseInt(id.slice(1));
      if (id.startsWith("B")) return 200 + parseInt(id.slice(1));
      return 300 + parseInt(id.slice(1)); // C
    };
    return Array.from(selectedSeats).sort((a, b) => order(a) - order(b));
  }, [selectedSeats]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={PURPLE_DARK} />

      <ConfirmModal
        visible={showConfirm}
        seatIds={selectedSorted}
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
          <Text style={s.legendText}>Taken ({takenSet.size})</Text>
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

          {/* Front bench — P1, P2 */}
          <View style={s.frontBench}>
            <Text style={s.frontBenchLabel}>Front bench</Text>
            <View style={s.frontBenchSeats}>
              {FRONT_BENCH.map(id => (
                <SeatButton
                  key={id}
                  seatId={id}
                  status={getSeatStatus(id)}
                  onPress={() => toggleSeat(id)}
                  color={busColor}
                />
              ))}
            </View>
          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* Column header */}
          <View style={s.colHeader}>
            <View style={s.rowNumCol} />
            <Text style={[s.colLabel, { flex: 3 }]}>Left  A</Text>
            <View style={s.aisleCol} />
            <Text style={[s.colLabel, { flex: 2 }]}>Right  B</Text>
          </View>

          {/* Seat rows 1–13 */}
          <View style={s.rowsWrap}>
            {rows.map(row => (
              <View key={row.rowNum} style={s.row}>
                {/* Row number */}
                <Text style={s.rowNum}>{row.rowNum}</Text>

                {/* Left group */}
                <View style={s.leftGroup}>
                  {row.isDriverRow ? (
                    <DriverSeat />
                  ) : (
                    row.leftSeats.map(id => (
                      <SeatButton
                        key={id}
                        seatId={id}
                        status={getSeatStatus(id)}
                        onPress={() => toggleSeat(id)}
                        color={busColor}
                      />
                    ))
                  )}
                </View>

                {/* Aisle */}
                <View style={s.aisle}>
                  <View style={s.aisleLine} />
                </View>

                {/* Right group */}
                <View style={s.rightGroup}>
                  {row.isDoorRow ? (
                    <View style={s.doorBox}>
                      <Text style={s.doorIcon}>🚪</Text>
                      <Text style={s.doorText}>Door</Text>
                    </View>
                  ) : (
                    row.rightSeats.map(id => (
                      <SeatButton
                        key={id}
                        seatId={id}
                        status={getSeatStatus(id)}
                        onPress={() => toggleSeat(id)}
                        color={busColor}
                      />
                    ))
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Back bench — C1–C7 */}
          <View style={s.backBench}>
            <Text style={s.backBenchLabel}>Back bench  C</Text>
            <View style={s.backBenchSeats}>
              {BACK_BENCH.map(id => (
                <SeatButton
                  key={id}
                  seatId={id}
                  status={getSeatStatus(id)}
                  onPress={() => toggleSeat(id)}
                  color={busColor}
                  wide
                />
              ))}
            </View>
          </View>

          {/* Rear */}
          <View style={s.busRear}>
            <Text style={s.busRearText}>🔚  Rear</Text>
          </View>
        </View>

        {/* Capacity info */}
        <View style={s.capacityBar}>
          <View style={[s.capacityFill, { width: `${(takenSet.size / totalBookable) * 100}%`, backgroundColor: takenSet.size / totalBookable > 0.8 ? RED : busColor }]} />
        </View>
        <Text style={s.capacityLabel}>
          {takenSet.size} of {totalBookable} seats occupied · {totalBookable - takenSet.size} available
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

  // Front bench strip
  frontBench: {
    backgroundColor: "#3C1A7A",
    paddingVertical: 8, paddingHorizontal: 14,
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  frontBenchLabel: { fontSize: 10, color: "#A78BFA", fontWeight: "600", flex: 1 },
  frontBenchSeats: { flexDirection: "row", gap: 8 },

  // Column header
  colHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingTop: 6, paddingBottom: 2 },
  rowNumCol: { width: 22 },
  colLabel: { fontSize: 10, fontWeight: "700", color: MUTED, textAlign: "center", letterSpacing: 0.4 },
  aisleCol: { width: 26 },

  rowsWrap: { paddingVertical: 8, paddingHorizontal: 10, gap: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  rowNum: { fontSize: 9, color: MUTED, fontWeight: "800", width: 22, textAlign: "center" },

  leftGroup:  { flex: 3, flexDirection: "row", gap: 4, justifyContent: "center" },
  rightGroup: { flex: 2, flexDirection: "row", gap: 4, paddingLeft: 4 },

  aisle: { width: 26, alignItems: "center", justifyContent: "center" },
  aisleLine: { width: 2, height: 28, backgroundColor: BORDER, borderRadius: 1 },

  // Door placeholder
  doorBox: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderWidth: 1.5, borderColor: "#CA8A04", borderStyle: "dashed",
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6,
    backgroundColor: "#FEF3C7",
  },
  doorIcon: { fontSize: 14 },
  doorText: { fontSize: 10, fontWeight: "700", color: "#92400E" },

  // Back bench
  backBench: {
    backgroundColor: BG,
    borderTopWidth: 2, borderTopColor: BORDER,
    paddingVertical: 10, paddingHorizontal: 14,
    alignItems: "center", gap: 6,
  },
  backBenchLabel: { fontSize: 10, color: MUTED, fontWeight: "700", letterSpacing: 0.4 },
  backBenchSeats: { flexDirection: "row", gap: 5, flexWrap: "wrap", justifyContent: "center" },

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