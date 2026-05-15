import React, { useState, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Platform, StatusBar, Image, Modal,
  ActivityIndicator, Animated,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { getBookingsByName, getBookingByRef, getAllBookings, BookingRecord } from "../../context/BookingsStore";

// ─── COLOURS ─────────────────────────────────────────────────────────────────
const PURPLE_DARK = "#4C1D95";
const PURPLE      = "#7C3AED";
const PURPLE_LIGHT= "#EDE9FE";
const GOLD        = "#F59E0B";
const GREEN       = "#16A34A";
const BG          = "#F5F3FF";
const CARD        = "#FFFFFF";
const TEXT_C      = "#1E1B4B";
const MUTED       = "#6B7280";
const BORDER      = "#DDD6FE";
const RED         = "#DC2626";
const ORANGE      = "#EA580C";

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: BookingRecord["status"] }) {
  const cfg = {
    confirmed: { bg: "#DCFCE7", color: "#15803D", label: "✅ Confirmed" },
    pending:   { bg: "#FEF3C7", color: "#92400E", label: "⏳ Pending"   },
    cancelled: { bg: "#FEE2E2", color: "#991B1B", label: "❌ Cancelled" },
  }[status];
  return (
    <View style={[bd.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[bd.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}
const bd = StyleSheet.create({
  badge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start" },
  badgeText: { fontSize: 11, fontWeight: "800" },
});

// ─── PAYMENT METHOD LABEL ─────────────────────────────────────────────────────
function payLabel(b: BookingRecord) {
  if (b.paymentMethod === "mtn")    return "MTN Mobile Money";
  if (b.paymentMethod === "orange") return "Orange Money";
  return `Bank Transfer${b.bankName ? ` · ${b.bankName}` : ""}`;
}

// ─── MINI TICKET (inside detail modal) ───────────────────────────────────────
function MiniTicket({ b }: { b: BookingRecord }) {
  const color = b.busColor || PURPLE;
  return (
    <View style={mt.ticket}>
      <View style={[mt.header, { backgroundColor: color }]}>
        <View>
          <Text style={mt.agency}>{b.agency}</Text>
          <Text style={mt.ticketNum}>{b.ticketNumber}</Text>
        </View>
        <Text style={mt.busEmoji}>🚌</Text>
      </View>
      <View style={mt.notchRow}>
        <View style={mt.notch} /><View style={mt.dash} /><View style={mt.notch} />
      </View>
      <View style={mt.routeRow}>
        <View style={{ flex: 1 }}>
          <Text style={mt.cityLbl}>FROM</Text>
          <Text style={mt.city}>{b.from}</Text>
          <Text style={[mt.time, { color }]}>{b.dep}</Text>
        </View>
        <Text style={[mt.arrow, { color }]}>✈ →</Text>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={mt.cityLbl}>TO</Text>
          <Text style={mt.city}>{b.to}</Text>
          <Text style={[mt.time, { color }]}>{b.arr}</Text>
        </View>
      </View>
      <View style={mt.grid}>
        {[
          { l: "Date",      v: b.date || "—" },
          { l: "Seat(s)",   v: b.seats.join(", ") },
          { l: "Class",     v: b.busClass },
          { l: "Plate No.", v: b.plate },
        ].map((item, i) => (
          <View key={i} style={mt.gridItem}>
            <Text style={mt.gridLbl}>{item.l}</Text>
            <Text style={mt.gridVal}>{item.v}</Text>
          </View>
        ))}
      </View>
      <View style={mt.notchRow}>
        <View style={mt.notch} /><View style={mt.dash} /><View style={mt.notch} />
      </View>
      <View style={mt.passengerRow}>
        {b.idImageUri ? (
          <Image source={{ uri: b.idImageUri }} style={mt.idThumb} resizeMode="cover" />
        ) : (
          <View style={[mt.idPlaceholder, { borderColor: color }]}><Text style={{ fontSize: 18 }}>🪪</Text></View>
        )}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={mt.paxLbl}>PASSENGER</Text>
          <Text style={mt.paxName}>{b.passengerName}</Text>
          <Text style={mt.paxAge}>Age {b.age}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={mt.totalLbl}>TOTAL</Text>
          <Text style={[mt.totalVal, { color }]}>{b.totalAmount.toLocaleString()}</Text>
          <Text style={mt.totalCur}>XAF</Text>
        </View>
      </View>
      <View style={[mt.footer, { backgroundColor: color + "18", borderColor: color + "30" }]}>
        <Text style={[mt.barcode, { color }]}>▐ ▌▐▌▐▐▌▌▐ ▌▐▌ {b.bookingRef} ▐▌▐ ▌▐▌▐▐▌▌ ▌▐ ▌</Text>
        <Text style={mt.footerSub}>Show at terminal · Valid for travel date only</Text>
      </View>
    </View>
  );
}

const mt = StyleSheet.create({
  ticket: { backgroundColor: CARD, borderRadius: 18, overflow: "hidden", marginBottom: 16, elevation: 4, shadowColor: PURPLE_DARK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  agency: { fontSize: 18, fontWeight: "900", color: "#fff" },
  ticketNum: { fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: "600", marginTop: 2 },
  busEmoji: { fontSize: 30 },
  notchRow: { flexDirection: "row", alignItems: "center" },
  notch: { width: 18, height: 18, borderRadius: 9, backgroundColor: BG, marginHorizontal: -9 },
  dash: { flex: 1, borderTopWidth: 1.5, borderTopColor: BORDER, borderStyle: "dashed" },
  routeRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14 },
  cityLbl: { fontSize: 8, fontWeight: "800", color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  city: { fontSize: 16, fontWeight: "900", color: TEXT_C },
  time: { fontSize: 13, fontWeight: "800", marginTop: 2 },
  arrow: { fontSize: 16, fontWeight: "900", marginHorizontal: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, paddingBottom: 10, gap: 8 },
  gridItem: { width: "46%", backgroundColor: BG, borderRadius: 10, padding: 8 },
  gridLbl: { fontSize: 8, color: MUTED, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 },
  gridVal: { fontSize: 11, color: TEXT_C, fontWeight: "800" },
  passengerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  idThumb: { width: 48, height: 48, borderRadius: 8 },
  idPlaceholder: { width: 48, height: 48, borderRadius: 8, borderWidth: 1.5, borderStyle: "dashed", alignItems: "center", justifyContent: "center", backgroundColor: BG },
  paxLbl: { fontSize: 8, fontWeight: "800", color: MUTED, textTransform: "uppercase", letterSpacing: 1 },
  paxName: { fontSize: 15, fontWeight: "900", color: TEXT_C, marginTop: 2 },
  paxAge: { fontSize: 11, color: MUTED, fontWeight: "600", marginTop: 1 },
  totalLbl: { fontSize: 8, fontWeight: "800", color: MUTED, textTransform: "uppercase", letterSpacing: 1 },
  totalVal: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  totalCur: { fontSize: 10, color: MUTED, fontWeight: "700" },
  footer: { borderTopWidth: 1, padding: 10, alignItems: "center", gap: 3 },
  barcode: { fontSize: 7, fontWeight: "700", letterSpacing: 0.3, textAlign: "center" },
  footerSub: { fontSize: 9, color: MUTED, fontWeight: "600" },
});

// ─── BOOKING CARD (list item) ──────────────────────────────────────────────────
function BookingCard({ b, onPress }: { b: BookingRecord; onPress: () => void }) {
  const color = b.busColor || PURPLE;
  const dateStr = new Date(b.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return (
    <TouchableOpacity style={bc.card} onPress={onPress} activeOpacity={0.82}>
      {/* Color accent stripe */}
      <View style={[bc.stripe, { backgroundColor: color }]} />
      <View style={bc.body}>
        <View style={bc.topRow}>
          <View style={bc.agencyWrap}>
            <Text style={[bc.agencyText, { color }]}>{b.agency}</Text>
            <StatusBadge status={b.status} />
          </View>
          <Text style={bc.dateText}>{dateStr}</Text>
        </View>

        <View style={bc.routeRow}>
          <View style={{ flex: 1 }}>
            <Text style={bc.routeCity}>{b.from}</Text>
            <Text style={[bc.routeTime, { color }]}>{b.dep}</Text>
          </View>
          <View style={bc.arrowWrap}>
            <Text style={[bc.routeArrow, { color }]}>✈ ──→</Text>
            <Text style={bc.classBadge}>{b.busClass}</Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={bc.routeCity}>{b.to}</Text>
            <Text style={[bc.routeTime, { color }]}>{b.arr}</Text>
          </View>
        </View>

        <View style={bc.metaRow}>
          <Text style={bc.metaText}>💺 {b.seats.join(", ")}</Text>
          <Text style={bc.metaText}>📅 {b.date || "—"}</Text>
          <Text style={bc.metaText}>💰 {b.totalAmount.toLocaleString()} XAF</Text>
        </View>

        <View style={bc.refRow}>
          <Text style={bc.refText}>{b.bookingRef}</Text>
          <Text style={[bc.viewBtn, { color }]}>View details →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const bc = StyleSheet.create({
  card: {
    backgroundColor: CARD, borderRadius: 20, marginBottom: 14,
    flexDirection: "row", overflow: "hidden",
    shadowColor: PURPLE_DARK, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
    borderWidth: 1.5, borderColor: BORDER,
  },
  stripe: { width: 6 },
  body: { flex: 1, padding: 14 },
  topRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, gap: 8 },
  agencyWrap: { gap: 6 },
  agencyText: { fontSize: 15, fontWeight: "900" },
  dateText: { fontSize: 10, color: MUTED, fontWeight: "600" },
  routeRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  routeCity: { fontSize: 16, fontWeight: "900", color: TEXT_C },
  routeTime: { fontSize: 12, fontWeight: "800", marginTop: 2 },
  arrowWrap: { flex: 1.2, alignItems: "center", gap: 2 },
  routeArrow: { fontSize: 14, fontWeight: "900" },
  classBadge: { fontSize: 9, color: MUTED, fontWeight: "700", textTransform: "uppercase" },
  metaRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginBottom: 10 },
  metaText: { fontSize: 11, color: TEXT_C, fontWeight: "600" },
  refRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  refText: { fontSize: 10, color: MUTED, fontWeight: "700", letterSpacing: 0.4 },
  viewBtn: { fontSize: 12, fontWeight: "800" },
});

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
function DetailModal({ booking, onClose }: { booking: BookingRecord | null; onClose: () => void }) {
  if (!booking) return null;
  const color = booking.busColor || PURPLE;

  return (
    <Modal visible={!!booking} animationType="slide" transparent onRequestClose={onClose}>
      <View style={dm.overlay}>
        <View style={dm.sheet}>
          <View style={dm.handle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={dm.sheetTitle}>Booking Details</Text>

            {/* Ticket */}
            <MiniTicket b={booking} />

            {/* Passenger info */}
            <Text style={dm.sectionLabel}>👤  Passenger</Text>
            <View style={dm.infoCard}>
              {[
                { label: "Full Name",    value: booking.passengerName },
                { label: "Age",          value: booking.age },
                { label: "Phone",        value: booking.phone || "—" },
                { label: "Nationality",  value: booking.nationality || "—" },
                { label: "ID Type",      value: booking.idType },
                { label: "ID Number",    value: booking.idNumber },
              ].map((row, i, arr) => (
                <View key={i} style={[dm.infoRow, i < arr.length - 1 && dm.infoRowBorder]}>
                  <Text style={dm.infoLabel}>{row.label}</Text>
                  <Text style={dm.infoValue}>{row.value}</Text>
                </View>
              ))}
            </View>

            {/* Payment info */}
            <Text style={dm.sectionLabel}>💳  Payment</Text>
            <View style={dm.infoCard}>
              {[
                { label: "Method",       value: payLabel(booking) },
                { label: "Amount Paid",  value: `${booking.totalAmount.toLocaleString()} XAF` },
                { label: "Status",       value: booking.status.charAt(0).toUpperCase() + booking.status.slice(1) },
              ].map((row, i, arr) => (
                <View key={i} style={[dm.infoRow, i < arr.length - 1 && dm.infoRowBorder]}>
                  <Text style={dm.infoLabel}>{row.label}</Text>
                  <Text style={[dm.infoValue, row.label === "Amount Paid" && { color, fontSize: 16 }]}>{row.value}</Text>
                </View>
              ))}
            </View>

            {/* Receipt preview */}
            {booking.receiptUri ? (
              <>
                <Text style={dm.sectionLabel}>📎  Payment Receipt</Text>
                <Image source={{ uri: booking.receiptUri }} style={dm.receiptImg} resizeMode="contain" />
              </>
            ) : null}

            {/* ID photo preview */}
            {booking.idImageUri ? (
              <>
                <Text style={dm.sectionLabel}>🪪  ID Document Photo</Text>
                <Image source={{ uri: booking.idImageUri }} style={dm.receiptImg} resizeMode="contain" />
              </>
            ) : null}

            <TouchableOpacity style={[dm.closeBtn, { backgroundColor: color }]} onPress={onClose}>
              <Text style={dm.closeBtnText}>Close</Text>
            </TouchableOpacity>
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const dm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: BG, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12,
    maxHeight: "94%",
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB", alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 22, fontWeight: "900", color: TEXT_C, marginBottom: 16, letterSpacing: -0.4 },

  sectionLabel: { fontSize: 11, fontWeight: "800", color: MUTED, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },

  infoCard: {
    backgroundColor: CARD, borderRadius: 18, borderWidth: 1.5, borderColor: BORDER, overflow: "hidden",
    marginBottom: 12, shadowColor: PURPLE_DARK, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  infoLabel: { fontSize: 12, color: MUTED, fontWeight: "600", flex: 1 },
  infoValue: { fontSize: 13, color: TEXT_C, fontWeight: "800", flex: 2, textAlign: "right" },

  receiptImg: { width: "100%", height: 200, borderRadius: 16, marginBottom: 12, backgroundColor: "#F3F4F6" },

  closeBtn: { borderRadius: 18, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  closeBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function MyBookingsScreen() {
  const [searchMode, setSearchMode]   = useState<"name" | "ref">("name");
  const [query, setQuery]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [results, setResults]         = useState<BookingRecord[] | null>(null);
  const [notFound, setNotFound]       = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [recentBookings, setRecentBookings] = useState<BookingRecord[]>([]);

  // Load recent bookings whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const all = await getAllBookings();
        setRecentBookings(all.slice(0, 3));
      })();
    }, [])
  );

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResults(null);
    await new Promise(r => setTimeout(r, 500)); // brief UX delay
    let found: BookingRecord[] = [];
    if (searchMode === "name") {
      found = await getBookingsByName(query.trim());
    } else {
      const single = await getBookingByRef(query.trim());
      if (single) found = [single];
    }
    setLoading(false);
    if (found.length === 0) {
      setNotFound(true);
    } else {
      setResults(found);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={PURPLE_DARK} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.hCircle1} /><View style={s.hCircle2} />
        <Text style={s.headerEmoji}>🎟️</Text>
        <Text style={s.headerTitle}>My Bookings</Text>
        <Text style={s.headerSub}>Look up your bus reservations & tickets</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Search card */}
        <View style={s.searchCard}>
          {/* Mode toggle */}
          <View style={s.modeToggle}>
            {(["name", "ref"] as const).map(mode => (
              <TouchableOpacity
                key={mode}
                style={[s.modeBtn, searchMode === mode && s.modeBtnActive]}
                onPress={() => { setSearchMode(mode); setQuery(""); setResults(null); setNotFound(false); }}
              >
                <Text style={[s.modeBtnText, searchMode === mode && s.modeBtnTextActive]}>
                  {mode === "name" ? "🔍 Search by Name" : "📋 Search by Ref"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Search input */}
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              value={query}
              onChangeText={setQuery}
              placeholder={searchMode === "name" ? "Enter your full name…" : "Enter booking ref or ticket no…"}
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoCapitalize={searchMode === "name" ? "words" : "characters"}
            />
            <TouchableOpacity
              style={[s.searchBtn, { backgroundColor: query.trim() ? PURPLE : "#D1D5DB" }]}
              onPress={handleSearch}
              activeOpacity={0.82}
              disabled={!query.trim()}
            >
              <Text style={s.searchBtnText}>{loading ? "…" : "Go"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.searchHint}>
            {searchMode === "name"
              ? "Enter the name you used when booking your ticket"
              : "Enter your booking reference (e.g. CB-B001-123456) or ticket number"}
          </Text>
        </View>

        {/* Loading */}
        {loading && (
          <View style={s.centeredWrap}>
            <ActivityIndicator size="large" color={PURPLE} />
            <Text style={s.loadingText}>Looking up your booking…</Text>
          </View>
        )}

        {/* Not found */}
        {notFound && !loading && (
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>🔍</Text>
            <Text style={s.emptyTitle}>No Booking Found</Text>
            <Text style={s.emptySub}>
              We couldn't find a booking matching "{query}". Double-check your{" "}
              {searchMode === "name" ? "full name as entered during booking" : "booking reference or ticket number"}.
            </Text>
          </View>
        )}

        {/* Results */}
        {results && !loading && (
          <>
            <View style={s.resultsHeader}>
              <Text style={s.resultsTitle}>{results.length} booking{results.length > 1 ? "s" : ""} found</Text>
              <TouchableOpacity onPress={() => { setResults(null); setQuery(""); setNotFound(false); }}>
                <Text style={s.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            {results.map(b => (
              <BookingCard key={b.bookingRef} b={b} onPress={() => setSelectedBooking(b)} />
            ))}
          </>
        )}

        {/* Recent bookings (when no search active) */}
        {!results && !notFound && !loading && recentBookings.length > 0 && (
          <>
            <View style={s.resultsHeader}>
              <Text style={s.resultsTitle}>Recent Bookings</Text>
            </View>
            {recentBookings.map(b => (
              <BookingCard key={b.bookingRef} b={b} onPress={() => setSelectedBooking(b)} />
            ))}
          </>
        )}

        {/* Empty state (no bookings at all) */}
        {!results && !notFound && !loading && recentBookings.length === 0 && (
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>🚌</Text>
            <Text style={s.emptyTitle}>No Bookings Yet</Text>
            <Text style={s.emptySub}>Once you book a bus and generate a ticket, it will appear here. Search above after your first booking.</Text>
          </View>
        )}

        {/* Info tips */}
        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>💡 Good to know</Text>
          <Text style={s.tipItem}>• Your booking status is <Text style={{ fontWeight: "800" }}>Pending</Text> until payment is verified by the agency.</Text>
          <Text style={s.tipItem}>• Arrive at the terminal at least <Text style={{ fontWeight: "800" }}>20 minutes</Text> before departure.</Text>
          <Text style={s.tipItem}>• Bring a printed or digital copy of your ticket and ID.</Text>
          <Text style={s.tipItem}>• For queries, contact your agency's terminal directly.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <DetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: {
    paddingTop: Platform.OS === "android" ? 50 : 62,
    paddingHorizontal: 24,
    paddingBottom: 28,
    backgroundColor: PURPLE_DARK,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
  },
  hCircle1: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: PURPLE, opacity: 0.18, right: -60, top: -60 },
  hCircle2: { position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: "#A78BFA", opacity: 0.12, left: -20, bottom: -40 },
  headerEmoji: { fontSize: 40, marginBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: "900", color: "#fff", letterSpacing: -0.6 },
  headerSub: { fontSize: 13, color: "#C4B5FD", fontWeight: "500", marginTop: 4, textAlign: "center" },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  searchCard: {
    backgroundColor: CARD, borderRadius: 22, padding: 18, marginBottom: 20,
    borderWidth: 1.5, borderColor: BORDER,
    shadowColor: PURPLE_DARK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
  },
  modeToggle: { flexDirection: "row", gap: 8, marginBottom: 14 },
  modeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 14,
    backgroundColor: BG, borderWidth: 1.5, borderColor: BORDER, alignItems: "center",
  },
  modeBtnActive: { backgroundColor: PURPLE_LIGHT, borderColor: PURPLE },
  modeBtnText: { fontSize: 12, fontWeight: "700", color: MUTED },
  modeBtnTextActive: { color: PURPLE, fontWeight: "800" },

  inputRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  input: {
    flex: 1, backgroundColor: BG, borderRadius: 14, borderWidth: 1.5, borderColor: BORDER,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: TEXT_C, fontWeight: "600",
  },
  searchBtn: { borderRadius: 14, paddingHorizontal: 22, justifyContent: "center", alignItems: "center" },
  searchBtnText: { color: "#fff", fontWeight: "900", fontSize: 15 },
  searchHint: { fontSize: 11, color: MUTED, fontWeight: "500", lineHeight: 16 },

  centeredWrap: { alignItems: "center", paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14, color: MUTED, fontWeight: "600" },

  emptyWrap: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "900", color: TEXT_C, marginBottom: 8 },
  emptySub: { fontSize: 13, color: MUTED, textAlign: "center", lineHeight: 20 },

  resultsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  resultsTitle: { fontSize: 13, fontWeight: "800", color: TEXT_C },
  clearText: { fontSize: 12, color: PURPLE, fontWeight: "700" },

  tipsCard: {
    backgroundColor: PURPLE_LIGHT, borderRadius: 18, padding: 16,
    borderWidth: 1.5, borderColor: BORDER, marginTop: 8,
  },
  tipsTitle: { fontSize: 13, fontWeight: "800", color: PURPLE_DARK, marginBottom: 10 },
  tipItem: { fontSize: 12, color: TEXT_C, lineHeight: 20, marginBottom: 4 },
});