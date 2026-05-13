import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";

const MOCK_PACKAGES = [
  {
    id: "CBX-2024-00183",
    status: "In Transit",
    statusColor: "#7C3AED",
    statusBg: "#EDE9FE",
    from: "Yaoundé",
    to: "Douala",
    agency: "Général Express",
    sent: "Today, 08:00",
    eta: "Today, ~11:30",
    weight: "2.4 kg",
    steps: [
      { label: "Package Received", done: true, time: "08:00" },
      { label: "Loaded on Bus", done: true, time: "08:15" },
      { label: "In Transit", done: true, time: "08:20" },
      { label: "Arrived at Terminal", done: false, time: "~11:30" },
      { label: "Ready for Pickup", done: false, time: "~11:45" },
    ],
  },
  {
    id: "CBX-2024-00171",
    status: "Delivered",
    statusColor: "#16A34A",
    statusBg: "#DCFCE7",
    from: "Douala",
    to: "Bamenda",
    agency: "Touristique Express",
    sent: "Yesterday, 19:00",
    eta: "Today, 01:00",
    weight: "5.1 kg",
    steps: [
      { label: "Package Received", done: true, time: "19:00" },
      { label: "Loaded on Bus", done: true, time: "19:10" },
      { label: "In Transit", done: true, time: "19:15" },
      { label: "Arrived at Terminal", done: true, time: "01:05" },
      { label: "Ready for Pickup", done: true, time: "01:20" },
    ],
  },
];

const SEND_CITIES = [
  "Yaoundé", "Douala", "Bafoussam", "Bamenda", "Kribi",
  "Ebolowa", "Ngaoundéré", "Bertoua", "Garoua", "Maroua",
];

export default function PackagesScreen() {
  const [activeTab, setActiveTab] = useState<"track" | "send">("track");
  const [trackingId, setTrackingId] = useState("");
  const [trackedPackage, setTrackedPackage] = useState<typeof MOCK_PACKAGES[0] | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Send form
  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [showCityModal, setShowCityModal] = useState(false);
  const [cityPickTarget, setCityPickTarget] = useState<"from" | "to">("from");
  const [citySearch, setCitySearch] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleTrack = () => {
    const found = MOCK_PACKAGES.find(
      (p) => p.id.toLowerCase() === trackingId.trim().toLowerCase()
    );
    if (found) {
      setTrackedPackage(found);
      setNotFound(false);
    } else {
      setTrackedPackage(null);
      setNotFound(true);
    }
  };

  const openCityPick = (target: "from" | "to") => {
    setCityPickTarget(target);
    setCitySearch("");
    setShowCityModal(true);
  };

  const selectCity = (city: string) => {
    if (cityPickTarget === "from") setFromCity(city);
    else setToCity(city);
    setShowCityModal(false);
  };

  const handleSend = () => {
    setShowConfirm(true);
  };

  const filteredCities = SEND_CITIES.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <View style={s.root}>
      {/* City Modal */}
      <Modal visible={showCityModal} animationType="slide" transparent onRequestClose={() => setShowCityModal(false)}>
        <View style={m.overlay}>
          <View style={m.sheet}>
            <View style={m.handle} />
            <Text style={m.sheetTitle}>{cityPickTarget === "from" ? "📍 From City" : "🏁 To City"}</Text>
            <View style={m.searchBox}>
              <Text style={{ fontSize: 15, marginRight: 8 }}>🔍</Text>
              <TextInput
                style={m.searchInput}
                placeholder="Search city..."
                placeholderTextColor="#A78BFA"
                value={citySearch}
                onChangeText={setCitySearch}
                autoFocus
              />
            </View>
            <ScrollView>
              {filteredCities.map((city) => (
                <TouchableOpacity key={city} style={m.cityItem} onPress={() => selectCity(city)}>
                  <Text style={m.cityName}>{city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={m.closeBtn} onPress={() => setShowCityModal(false)}>
              <Text style={m.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showConfirm} animationType="fade" transparent onRequestClose={() => setShowConfirm(false)}>
        <View style={m.overlay}>
          <View style={m.successSheet}>
            <Text style={m.successEmoji}>🎉</Text>
            <Text style={m.successTitle}>Package Registered!</Text>
            <Text style={m.successId}>CBX-2024-{String(Math.floor(Math.random() * 90000) + 10000)}</Text>
            <Text style={m.successSub}>Your package will depart at the next available bus time. Show this ID at the terminal.</Text>
            <TouchableOpacity style={m.successBtn} onPress={() => setShowConfirm(false)}>
              <Text style={m.successBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>📦 Packages</Text>
        <Text style={s.headerSub}>Send & track your packages across Cameroon</Text>

        {/* Tabs */}
        <View style={s.tabRow}>
          <TouchableOpacity
            style={[s.tab, activeTab === "track" && s.tabActive]}
            onPress={() => setActiveTab("track")}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, activeTab === "track" && s.tabTextActive]}>📍 Track Package</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, activeTab === "send" && s.tabActive]}
            onPress={() => setActiveTab("send")}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, activeTab === "send" && s.tabTextActive]}>📤 Send Package</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── TRACK TAB ── */}
        {activeTab === "track" && (
          <View>
            {/* Search */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Enter Tracking ID</Text>
              <Text style={s.cardSub}>Try: CBX-2024-00183 or CBX-2024-00171</Text>
              <View style={s.trackRow}>
                <TextInput
                  style={s.trackInput}
                  placeholder="e.g. CBX-2024-00183"
                  placeholderTextColor="#C4B5FD"
                  value={trackingId}
                  onChangeText={setTrackingId}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={s.trackBtn} onPress={handleTrack} activeOpacity={0.8}>
                  <Text style={s.trackBtnText}>Track</Text>
                </TouchableOpacity>
              </View>
              {notFound && (
                <View style={s.notFound}>
                  <Text style={s.notFoundText}>❌ No package found with this ID.</Text>
                </View>
              )}
            </View>

            {/* Recent Packages */}
            <Text style={s.sectionLabel}>Recent Packages</Text>
            {MOCK_PACKAGES.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={s.pkgCard}
                onPress={() => { setTrackingId(pkg.id); setTrackedPackage(pkg); setNotFound(false); }}
                activeOpacity={0.8}
              >
                <View style={s.pkgCardTop}>
                  <Text style={s.pkgId}>{pkg.id}</Text>
                  <View style={[s.statusBadge, { backgroundColor: pkg.statusBg }]}>
                    <Text style={[s.statusText, { color: pkg.statusColor }]}>{pkg.status}</Text>
                  </View>
                </View>
                <Text style={s.pkgRoute}>{pkg.from} → {pkg.to}</Text>
                <Text style={s.pkgMeta}>via {pkg.agency} · {pkg.weight}</Text>
              </TouchableOpacity>
            ))}

            {/* Tracked Package Detail */}
            {trackedPackage && (
              <View style={s.detailCard}>
                <View style={s.detailHeader}>
                  <View>
                    <Text style={s.detailId}>{trackedPackage.id}</Text>
                    <Text style={s.detailRoute}>{trackedPackage.from} → {trackedPackage.to}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: trackedPackage.statusBg }]}>
                    <Text style={[s.statusText, { color: trackedPackage.statusColor }]}>{trackedPackage.status}</Text>
                  </View>
                </View>

                <View style={s.detailInfoRow}>
                  <View style={s.detailInfoItem}>
                    <Text style={s.detailInfoLabel}>Agency</Text>
                    <Text style={s.detailInfoValue}>{trackedPackage.agency}</Text>
                  </View>
                  <View style={s.detailInfoItem}>
                    <Text style={s.detailInfoLabel}>Weight</Text>
                    <Text style={s.detailInfoValue}>{trackedPackage.weight}</Text>
                  </View>
                  <View style={s.detailInfoItem}>
                    <Text style={s.detailInfoLabel}>ETA</Text>
                    <Text style={s.detailInfoValue}>{trackedPackage.eta}</Text>
                  </View>
                </View>

                <Text style={s.timelineTitle}>Tracking Timeline</Text>
                {trackedPackage.steps.map((step, i) => (
                  <View key={i} style={s.timelineRow}>
                    <View style={s.timelineLeft}>
                      <View style={[s.timelineDot, step.done && s.timelineDotDone]}>
                        {step.done && <Text style={{ fontSize: 10, color: "#fff" }}>✓</Text>}
                      </View>
                      {i < trackedPackage.steps.length - 1 && (
                        <View style={[s.timelineLine, step.done && s.timelineLineDone]} />
                      )}
                    </View>
                    <View style={s.timelineContent}>
                      <Text style={[s.timelineLabel, step.done && s.timelineLabelDone]}>{step.label}</Text>
                      <Text style={s.timelineTime}>{step.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── SEND TAB ── */}
        {activeTab === "send" && (
          <View>
            <View style={s.card}>
              <Text style={s.cardTitle}>Package Details</Text>

              <Text style={s.fieldLabel}>Sender Name</Text>
              <TextInput style={s.fieldInput} placeholder="Your full name" placeholderTextColor="#C4B5FD" value={senderName} onChangeText={setSenderName} />

              <Text style={s.fieldLabel}>Receiver Name</Text>
              <TextInput style={s.fieldInput} placeholder="Receiver's full name" placeholderTextColor="#C4B5FD" value={receiverName} onChangeText={setReceiverName} />

              <Text style={s.fieldLabel}>From City</Text>
              <TouchableOpacity style={s.cityPickBtn} onPress={() => openCityPick("from")} activeOpacity={0.7}>
                <Text style={[s.cityPickText, !fromCity && s.cityPickPlaceholder]}>{fromCity || "Select departure city"}</Text>
                <Text style={{ fontSize: 16, color: "#C4B5FD" }}>›</Text>
              </TouchableOpacity>

              <Text style={s.fieldLabel}>To City</Text>
              <TouchableOpacity style={s.cityPickBtn} onPress={() => openCityPick("to")} activeOpacity={0.7}>
                <Text style={[s.cityPickText, !toCity && s.cityPickPlaceholder]}>{toCity || "Select destination city"}</Text>
                <Text style={{ fontSize: 16, color: "#C4B5FD" }}>›</Text>
              </TouchableOpacity>

              <Text style={s.fieldLabel}>Package Weight (kg)</Text>
              <TextInput style={s.fieldInput} placeholder="e.g. 2.5" placeholderTextColor="#C4B5FD" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />

              <Text style={s.fieldLabel}>Package Description</Text>
              <TextInput
                style={[s.fieldInput, { height: 80, textAlignVertical: "top" }]}
                placeholder="Briefly describe what's inside..."
                placeholderTextColor="#C4B5FD"
                value={description}
                onChangeText={setDescription}
                multiline
              />

              <View style={s.infoBox}>
                <Text style={s.infoBoxText}>📌 Packages travel with scheduled buses at 08:00 and 19:00 daily. Drop off at the agency terminal at least 30 min before departure.</Text>
              </View>

              <TouchableOpacity style={s.sendBtn} onPress={handleSend} activeOpacity={0.85}>
                <Text style={s.sendBtnText}>📤  Register Package</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const PURPLE = "#6D28D9";
const PURPLE_DARK = "#4C1D95";
const BORDER = "#DDD6FE";
const TEXT = "#1E1B4B";
const MUTED = "#6B7280";
const BG = "#F5F3FF";
const CARD = "#FFFFFF";

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },

  header: {
    backgroundColor: PURPLE_DARK,
    paddingTop: Platform.OS === "android" ? 52 : 64,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: { fontSize: 32, fontWeight: "900", color: "#fff", letterSpacing: -1 },
  headerSub: { fontSize: 13, color: "#A78BFA", marginTop: 4, marginBottom: 18, fontWeight: "500" },

  tabRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  tabActive: { backgroundColor: "#fff" },
  tabText: { fontSize: 13, fontWeight: "700", color: "#C4B5FD" },
  tabTextActive: { color: PURPLE_DARK },

  sectionLabel: { fontSize: 16, fontWeight: "800", color: TEXT, marginTop: 20, marginBottom: 10 },

  card: {
    backgroundColor: CARD, borderRadius: 24, padding: 20,
    shadowColor: PURPLE_DARK, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: TEXT, marginBottom: 4 },
  cardSub: { fontSize: 12, color: MUTED, marginBottom: 14 },

  trackRow: { flexDirection: "row", gap: 10 },
  trackInput: {
    flex: 1, backgroundColor: "#F5F3FF", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: TEXT, fontWeight: "600",
    borderWidth: 1.5, borderColor: BORDER,
  },
  trackBtn: {
    backgroundColor: PURPLE_DARK, borderRadius: 14,
    paddingHorizontal: 18, alignItems: "center", justifyContent: "center",
  },
  trackBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },

  notFound: { marginTop: 12, backgroundColor: "#FEF2F2", borderRadius: 12, padding: 12 },
  notFoundText: { color: "#DC2626", fontWeight: "600", fontSize: 13 },

  pkgCard: {
    backgroundColor: CARD, borderRadius: 18, padding: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: BORDER,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  pkgCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  pkgId: { fontSize: 13, fontWeight: "700", color: PURPLE },
  pkgRoute: { fontSize: 15, fontWeight: "700", color: TEXT },
  pkgMeta: { fontSize: 12, color: MUTED, marginTop: 3 },

  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: "800" },

  detailCard: {
    backgroundColor: CARD, borderRadius: 22, padding: 20, marginTop: 4,
    shadowColor: PURPLE_DARK, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 8,
    borderWidth: 1.5, borderColor: "#EDE9FE",
  },
  detailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  detailId: { fontSize: 13, fontWeight: "700", color: PURPLE, marginBottom: 4 },
  detailRoute: { fontSize: 18, fontWeight: "900", color: TEXT, letterSpacing: -0.4 },

  detailInfoRow: { flexDirection: "row", backgroundColor: "#F5F3FF", borderRadius: 14, padding: 12, marginBottom: 20, gap: 4 },
  detailInfoItem: { flex: 1, alignItems: "center" },
  detailInfoLabel: { fontSize: 10, fontWeight: "700", color: PURPLE, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  detailInfoValue: { fontSize: 12, fontWeight: "700", color: TEXT, textAlign: "center" },

  timelineTitle: { fontSize: 14, fontWeight: "800", color: TEXT, marginBottom: 14 },
  timelineRow: { flexDirection: "row", marginBottom: 0 },
  timelineLeft: { width: 32, alignItems: "center" },
  timelineDot: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: BORDER,
    alignItems: "center", justifyContent: "center", backgroundColor: "#fff",
  },
  timelineDotDone: { backgroundColor: PURPLE, borderColor: PURPLE },
  timelineLine: { width: 2, flex: 1, backgroundColor: BORDER, minHeight: 20 },
  timelineLineDone: { backgroundColor: PURPLE },
  timelineContent: { flex: 1, paddingLeft: 12, paddingBottom: 20 },
  timelineLabel: { fontSize: 13, fontWeight: "600", color: MUTED },
  timelineLabelDone: { color: TEXT, fontWeight: "700" },
  timelineTime: { fontSize: 11, color: MUTED, marginTop: 2 },

  // Send form
  fieldLabel: { fontSize: 11, fontWeight: "800", color: PURPLE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, marginTop: 14 },
  fieldInput: {
    backgroundColor: "#F5F3FF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: TEXT, fontWeight: "500", borderWidth: 1.5, borderColor: BORDER,
  },
  cityPickBtn: {
    backgroundColor: "#F5F3FF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1.5, borderColor: BORDER, flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  cityPickText: { fontSize: 14, color: TEXT, fontWeight: "600" },
  cityPickPlaceholder: { color: "#C4B5FD", fontWeight: "400" },

  infoBox: {
    backgroundColor: "#FEF3C7", borderRadius: 14, padding: 14, marginTop: 18,
    borderWidth: 1, borderColor: "#FDE68A",
  },
  infoBoxText: { fontSize: 12, color: "#92400E", lineHeight: 18, fontWeight: "500" },

  sendBtn: {
    marginTop: 18, backgroundColor: PURPLE_DARK, borderRadius: 18,
    paddingVertical: 17, alignItems: "center",
    shadowColor: PURPLE_DARK, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  sendBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12, maxHeight: "75%",
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 20, fontWeight: "900", color: TEXT, marginBottom: 14 },
  searchBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F5F3FF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1.5, borderColor: BORDER, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: TEXT, fontWeight: "500" },
  cityItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  cityName: { fontSize: 15, color: TEXT, fontWeight: "600" },
  closeBtn: {
    marginTop: 8, marginBottom: Platform.OS === "ios" ? 32 : 16,
    backgroundColor: "#F5F3FF", borderRadius: 16, paddingVertical: 16, alignItems: "center",
  },
  closeBtnText: { fontSize: 15, fontWeight: "700", color: PURPLE },
  successSheet: {
    backgroundColor: "#fff", borderRadius: 28, margin: 24, padding: 32, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 30, elevation: 20,
  },
  successEmoji: { fontSize: 56, marginBottom: 12 },
  successTitle: { fontSize: 24, fontWeight: "900", color: TEXT, marginBottom: 8 },
  successId: { fontSize: 16, fontWeight: "800", color: PURPLE, marginBottom: 12 },
  successSub: { fontSize: 13, color: MUTED, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  successBtn: { backgroundColor: PURPLE_DARK, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 40 },
  successBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});