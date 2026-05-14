import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
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
import { useLang } from "../../context/LanguageContext";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PURPLE_DARK = "#4C1D95";
const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#EDE9FE";
const GOLD = "#F59E0B";
const BG = "#F5F3FF";
const CARD = "#FFFFFF";
const TEXT_C = "#1E1B4B";
const MUTED = "#6B7280";
const BORDER = "#DDD6FE";
const GREEN = "#16A34A";

// ─── AGENCY DATA ─────────────────────────────────────────────────────────────
const AGENCIES = [
  {
    name: "Nso Boys Agency",
    logo: require("../../assets/images/nso.png"),
    color: "#7C3AED",
    cities: ["Bamenda","Kumba","Limbé","Buea","Douala","Yaoundé","Mbouda","Bafoussam"],
    rating: "4.5",
    seats: "50-seat comfort",
    cross: false,
    badge: "NW Specialist",
    desc: "Serving NW Region & major cities",
  },
  {
    name: "Musango Agency",
    logo: require("../../assets/images/musango.png"),
    color: "#2563EB",
    cities: ["Douala","Yaoundé","Limbé","Bafoussam"],
    rating: "4.4",
    seats: "45-seat standard",
    cross: false,
    badge: "",
    desc: "Litoral, Centre & West routes",
  },
  {
    name: "Grand Jeannot Express",
    logo: require("../../assets/images/grand_jannot.png"),
    color: "#EA580C",
    cities: ["Bamenda","Douala","Limbé","Buea"],
    rating: "4.3",
    seats: "40-seat standard",
    cross: false,
    badge: "",
    desc: "Coastal & NW corridor",
  },
  {
    name: "Moghamo Express",
    logo: require("../../assets/images/moghamo.png"),
    color: "#92400E",
    cities: ["Bamenda","Douala","Yaoundé","Limbé","Buea"],
    rating: "4.4",
    seats: "48-seat comfort",
    cross: false,
    badge: "Dependable",
    desc: "NW & SW key cities coverage",
  },
  {
    name: "Amour Mezam",
    logo: require("../../assets/images/Amour_Mezam.png"),
    color: "#9333EA",
    cities: ["Bamenda","Yaoundé","Douala","Buea","Limbé"],
    rating: "4.6",
    seats: "50-seat VIP",
    cross: false,
    badge: "Regional Fave",
    desc: "Mezam region's favourite line",
  },
  {
    name: "Vatican Express",
    logo: require("../../assets/images/vatican.png"),
    color: "#475569",
    cities: ["Bamenda","Douala","Limbé","Yaoundé","Buea"],
    rating: "4.5",
    seats: "45-seat comfort",
    cross: false,
    badge: "Reliable",
    desc: "Trusted cross-region operator",
  },
  {
    name: "United Express",
    logo: require("../../assets/images/united.png"),
    color: "#0891B2",
    cities: ["Douala","Yaoundé"],
    rating: "4.7",
    seats: "60-seat luxury",
    cross: false,
    badge: "Corridor King",
    desc: "Douala–Yaoundé specialist",
  },
  {
    name: "Garanti Express",
    logo: require("../../assets/images/garanti.png"),
    color: "#DC2626",
    cities: ["Bamenda","Douala","Limbé","Yaoundé","Buea"],
    rating: "4.3",
    seats: "40-seat standard",
    cross: false,
    badge: "Budget Pick",
    desc: "Affordable inter-city travel",
  },
  {
    name: "Touristique Express",
    logo: require("../../assets/images/touristique.png"),
    color: "#16A34A",
    cities: ["Yaoundé","Douala","Ngaoundéré","Garoua","Maroua"],
    rating: "4.7",
    seats: "60-seat luxury",
    cross: false,
    badge: "Top Rated",
    desc: "North Cameroon routes expert",
  },
  {
    name: "The Peoples Agency",
    logo: require("../../assets/images/Thepeople.png"),
    color: "#DB2777",
    cities: ["Bamenda","Yaoundé","Douala"],
    rating: "4.2",
    seats: "45-seat standard",
    cross: false,
    badge: "",
    desc: "Affordable travel for all",
  },
  {
    name: "Buca Voyage",
    logo: require("../../assets/images/buca.png"),
    color: "#CA8A04",
    cities: ["Douala","Yaoundé","Bafoussam","Dschang","Foumban","Nkongsamba","Bafang","Mbouda"],
    rating: "4.6",
    seats: "55-seat VIP",
    cross: false,
    badge: "West & Centre",
    desc: "Littoral, Centre & West regions",
  },
  {
    name: "Général Express",
    logo: require("../../assets/images/general.png"),
    color: "#1D4ED8",
    cities: ["Yaoundé","Douala","Bamenda","Bafoussam","Kribi","Ebolowa","Ngaoundéré"],
    rating: "4.8",
    seats: "70-seat luxury",
    cross: false,
    badge: "Most Popular",
    desc: "Nationwide coverage leader",
  },
  {
    name: "Afrique Con",
    logo: require("../../assets/images/afriqueCon.png"),
    color: "#059669",
    cities: ["Douala","Buea","Yaoundé","Ikom (Nigeria)","Lagos (Nigeria)"],
    rating: "4.5",
    seats: "50-seat VIP",
    cross: true,
    badge: "International",
    desc: "Cameroon → Nigeria cross-border",
  },
];

// ─── CITIES ──────────────────────────────────────────────────────────────────
const CAMEROON_CITIES = [
  "Yaoundé","Douala","Bamenda","Bafoussam","Limbé","Buea","Kumba",
  "Kribi","Ebolowa","Ngaoundéré","Garoua","Maroua","Mbouda","Dschang",
  "Foumban","Bafang","Nkongsamba","Bertoua","Edéa","Bafia",
];
const INTERNATIONAL_CITIES = [
  "Lagos (Nigeria)","Ikom (Nigeria)","Abuja (Nigeria)",
  "Libreville (Gabon)","Brazzaville (Congo)","Bangui (CAR)",
];
const ALL_CITIES = [...CAMEROON_CITIES, ...INTERNATIONAL_CITIES];

const POPULAR_ROUTES = [
  { from: "Yaoundé", to: "Douala",     price: "4 500 XAF",  duration: "4h30", hours: 4.5 },
  { from: "Douala",  to: "Bafoussam",  price: "5 000 XAF",  duration: "5h30",   hours: 5.5 },
  { from: "Yaoundé", to: "Bamenda",    price: "6 500 XAF",  duration: "8h",   hours: 8   },
  { from: "Douala",  to: "Lagos",      price: "15 000 XAF", duration: "10h",   hours: 10   },
  { from: "Bamenda", to: "Douala",     price: "6 500 XAF",  duration: "7h",   hours: 7   },
  { from: "Yaoundé", to: "Ngaoundéré", price: "12 000 XAF",  duration: "12h",   hours: 12   },
];

const ROUTE_HOURS: Record<string, Record<string, number>> = {
  "Yaoundé": { "Douala": 4.5, "Bamenda": 8, "Bafoussam": 6.5, "Ngaoundéré": 12, "Kribi": 4, "Limbé": 6, "Buea": 6, "Ebolowa": 4 },
  "Douala":  { "Yaoundé": 4.5, "Bafoussam": 5.5, "Bamenda": 8, "Limbé": 2, "Buea": 2, "Kumba": 4, "Lagos (Nigeria)": 10, "Kribi": 4 },
  "Bamenda": { "Yaoundé": 8, "Douala": 7, "Bafoussam": 3, "Limbé": 8, "Buea": 8 },
};

function getRouteHours(from: string, to: string): number | null {
  return ROUTE_HOURS[from]?.[to] ?? ROUTE_HOURS[to]?.[from] ?? null;
}

// ─── CALENDAR MODAL ───────────────────────────────────────────────────────────
function CalendarModal({ visible, onClose, onSelect, t }: any) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const offset = firstDow === 0 ? 6 : firstDow - 1;
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const isPast = (d: number) =>
    new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const DOW = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={cal.overlay}>
        <View style={cal.sheet}>
          <View style={cal.handle} />
          <View style={cal.navRow}>
            <TouchableOpacity onPress={prev} style={cal.navBtn}>
              <Text style={cal.navArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={cal.monthLabel}>{t.months[month]} {year}</Text>
            <TouchableOpacity onPress={next} style={cal.navBtn}>
              <Text style={cal.navArrow}>›</Text>
            </TouchableOpacity>
          </View>
          <View style={cal.dowRow}>
            {DOW.map((d: string) => <Text key={d} style={cal.dowLabel}>{d}</Text>)}
          </View>
          <View style={cal.grid}>
            {cells.map((day, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  cal.cell,
                  day && isToday(day) && cal.cellToday,
                  day && isPast(day) && cal.cellPast,
                ]}
                onPress={() => {
                  if (!day || isPast(day)) return;
                  const dd = String(day).padStart(2, "0");
                  const mm = String(month + 1).padStart(2, "0");
                  onSelect(`${dd}/${mm}/${year}`);
                  onClose();
                }}
                disabled={!day || isPast(day)}
                activeOpacity={0.7}
              >
                {day ? (
                  <Text style={[
                    cal.cellText,
                    isToday(day) && cal.cellTextToday,
                    isPast(day) && cal.cellTextPast,
                  ]}>
                    {day}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={cal.cancelBtn} onPress={onClose}>
            <Text style={cal.cancelText}>{t.cancel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── CITY PICKER MODAL ────────────────────────────────────────────────────────
function CityPickerModal({ visible, onClose, onSelect, type, t }: any) {
  const [search, setSearch] = useState("");
  const isIntl = (c: string) => INTERNATIONAL_CITIES.includes(c);
  const filtered = ALL_CITIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  const domestic = filtered.filter(c => !isIntl(c));
  const intl = filtered.filter(c => isIntl(c));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={cp.overlay}>
        <View style={cp.sheet}>
          <View style={cp.handle} />
          <Text style={cp.title}>{type === "from" ? `📍 ${t.from}` : `🏁 ${t.to}`}</Text>
          <View style={cp.searchBox}>
            <Text style={{ fontSize: 15, marginRight: 8 }}>🔍</Text>
            <TextInput
              style={cp.searchInput}
              placeholder="Search city..."
              placeholderTextColor="#A78BFA"
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {domestic.length > 0 && (
              <>
                <Text style={cp.groupLabel}>{t.domestic}</Text>
                {domestic.map((c: string) => (
                  <TouchableOpacity
                    key={c}
                    style={cp.item}
                    onPress={() => { onSelect(c); onClose(); setSearch(""); }}
                  >
                    <Text style={cp.itemText}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
            {intl.length > 0 && (
              <>
                <Text style={cp.groupLabel}>{t.international}</Text>
                {intl.map((c: string) => (
                  <TouchableOpacity
                    key={c}
                    style={[cp.item, cp.itemIntl]}
                    onPress={() => { onSelect(c); onClose(); setSearch(""); }}
                  >
                    <Text style={cp.itemText}>{c}</Text>
                    <View style={cp.intlBadge}>
                      <Text style={cp.intlBadgeText}>{t.internat}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
          <TouchableOpacity style={cp.cancelBtn} onPress={() => { onClose(); setSearch(""); }}>
            <Text style={cp.cancelText}>{t.cancel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── TIME PICKER MODAL ────────────────────────────────────────────────────────
function TimePickerModal({ visible, onClose, onSelect, t }: any) {
  const [hour, setHour] = useState(8);
  const [min, setMin] = useState(0);
  const fmt = (n: number) => String(n).padStart(2, "0");

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={tp.overlay}>
        <View style={tp.sheet}>
          <View style={tp.handle} />
          <Text style={tp.title}>🕐 {t.pickTime}</Text>
          <View style={tp.pickerRow}>
            <View style={tp.col}>
              <TouchableOpacity onPress={() => setHour(h => (h + 1) % 24)} style={tp.arrow}>
                <Text style={tp.arrowText}>▲</Text>
              </TouchableOpacity>
              <View style={tp.numBox}>
                <Text style={tp.numText}>{fmt(hour)}</Text>
              </View>
              <TouchableOpacity onPress={() => setHour(h => (h - 1 + 24) % 24)} style={tp.arrow}>
                <Text style={tp.arrowText}>▼</Text>
              </TouchableOpacity>
            </View>
            <Text style={tp.colon}>:</Text>
            <View style={tp.col}>
              <TouchableOpacity onPress={() => setMin(m => (m + 5) % 60)} style={tp.arrow}>
                <Text style={tp.arrowText}>▲</Text>
              </TouchableOpacity>
              <View style={tp.numBox}>
                <Text style={tp.numText}>{fmt(min)}</Text>
              </View>
              <TouchableOpacity onPress={() => setMin(m => (m - 5 + 60) % 60)} style={tp.arrow}>
                <Text style={tp.arrowText}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={tp.quickRow}>
            {["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"].map(t2 => (
              <TouchableOpacity
                key={t2}
                style={tp.quickBtn}
                onPress={() => { const [h, m] = t2.split(":").map(Number); setHour(h); setMin(m); }}
              >
                <Text style={tp.quickBtnText}>{t2}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={tp.confirmBtn}
            onPress={() => { onSelect(`${fmt(hour)}:${fmt(min)}`); onClose(); }}
          >
            <Text style={tp.confirmText}>Confirm {fmt(hour)}:{fmt(min)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tp.cancelBtn} onPress={onClose}>
            <Text style={tp.cancelText}>{t.cancel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── AGENCY CARD ─────────────────────────────────────────────────────────────
function AgencyCard({ item }: { item: typeof AGENCIES[0] }) {
  return (
    <TouchableOpacity style={ag.card} activeOpacity={0.8}>
      <View style={[ag.accent, { backgroundColor: item.color }]} />

      <View style={[ag.iconWrap, { backgroundColor: item.color + "18" }]}>
        <Image
          source={item.logo}
          style={{ width: 36, height: 36 }}
          resizeMode="contain"
        />
      </View>

      <View style={ag.info}>
        <View style={ag.nameRow}>
          <Text style={ag.name} numberOfLines={1}>{item.name}</Text>
          {!!item.badge && (
            <View style={[ag.badge, { backgroundColor: item.color + "20" }]}>
              <Text style={[ag.badgeText, { color: item.color }]}>{item.badge}</Text>
            </View>
          )}
        </View>

        <Text style={ag.desc}>{item.desc}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 6, marginBottom: 2 }}
        >
          {item.cities.map((city, i) => (
            <View
              key={i}
              style={[ag.chip, { backgroundColor: item.color + "12", borderColor: item.color + "30" }]}
            >
              <Text style={[ag.chipText, { color: item.color }]}>{city}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={ag.footer}>
          <Text style={ag.star}>⭐ {item.rating}</Text>
          <Text style={ag.dot}>·</Text>
          <Text style={ag.seats}>{item.seats}</Text>
          {item.cross && (
            <>
              <Text style={ag.dot}>·</Text>
              <Text style={ag.cross}>🌍 Cross-border</Text>
            </>
          )}
        </View>
      </View>

      <Text style={{ fontSize: 20, color: "#C4B5FD", alignSelf: "center" }}>›</Text>
    </TouchableOpacity>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { t } = useLang();
  const router = useRouter();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [fixedTime, setFixedTime] = useState<"08:00" | "19:00" | null>(null);
  const [customTime, setCustomTime] = useState<string | null>(null);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [searchError, setSearchError] = useState("");

  const routeHours = useMemo(() => getRouteHours(from, to), [from, to]);
  const isLong = routeHours !== null && routeHours >= 6;
  const isShort = routeHours !== null && routeHours < 6;
  const citiesChosen = !!from && !!to;

  const handleSearch = () => {
    if (!from || !to) {
      setSearchError("Please choose both departure and destination cities.");
      return;
    }
    if (from === to) {
      setSearchError("Departure and destination cannot be the same city.");
      return;
    }
    setSearchError("");
    const time = isLong ? (fixedTime ?? "") : (customTime ?? "");
    router.push({
      pathname: "/search-results",
      params: { from, to, date, time },
    });
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={PURPLE_DARK} />

      <CityPickerModal
        visible={showFrom}
        onClose={() => setShowFrom(false)}
        onSelect={(c: string) => { setFrom(c); setSearchError(""); }}
        type="from"
        t={t}
      />
      <CityPickerModal
        visible={showTo}
        onClose={() => setShowTo(false)}
        onSelect={(c: string) => { setTo(c); setSearchError(""); }}
        type="to"
        t={t}
      />
      <CalendarModal visible={showCal} onClose={() => setShowCal(false)} onSelect={setDate} t={t} />
      <TimePickerModal visible={showTime} onClose={() => setShowTime(false)} onSelect={setCustomTime} t={t} />

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.greet}>{t.goodMorning}</Text>
              <Text style={s.brand}>CamerBus</Text>
              <Text style={s.sub}>{t.appSubtitle}</Text>
            </View>
            <View style={s.busBadge}>
              <Text style={{ fontSize: 36 }}>🚌</Text>
            </View>
          </View>
          <View style={s.circle1} />
          <View style={s.circle2} />
        </View>

        {/* ── SEARCH CARD ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t.bookSeat}</Text>

          {/* FROM */}
          <TouchableOpacity style={s.row} onPress={() => setShowFrom(true)} activeOpacity={0.75}>
            <View style={[s.rowIcon, { backgroundColor: "#F3F0FF" }]}>
              <Text style={{ fontSize: 17 }}>📍</Text>
            </View>
            <View style={s.rowText}>
              <Text style={s.rowLabel}>{t.from}</Text>
              <Text style={[s.rowValue, !from && s.rowPlaceholder]}>
                {from || t.chooseDeparture}
              </Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>

          {/* SWAP */}
          <View style={s.swapRow}>
            <View style={s.swapLine} />
            <TouchableOpacity
              style={s.swapBtn}
            onPress={() => { const tmp = from; setFrom(to); setTo(tmp); setSearchError(""); }}  
            >
              <Text style={{ fontSize: 17, color: "#fff", fontWeight: "900" }}>⇅</Text>
            </TouchableOpacity>
            <View style={s.swapLine} />
          </View>

          {/* TO */}
          <TouchableOpacity style={s.row} onPress={() => setShowTo(true)} activeOpacity={0.75}>
            <View style={[s.rowIcon, { backgroundColor: "#EDE9FE" }]}>
              <Text style={{ fontSize: 17 }}>🏁</Text>
            </View>
            <View style={s.rowText}>
              <Text style={s.rowLabel}>{t.to}</Text>
              <Text style={[s.rowValue, !to && s.rowPlaceholder]}>
                {to || t.chooseDestination}
              </Text>
            </View>
            {INTERNATIONAL_CITIES.includes(to) && (
              <View style={s.intlTag}>
                <Text style={s.intlTagText}>🌍</Text>
              </View>
            )}
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>

          {/* DATE */}
          <TouchableOpacity style={[s.row, { marginTop: 8 }]} onPress={() => setShowCal(true)} activeOpacity={0.75}>
            <View style={[s.rowIcon, { backgroundColor: "#FEF3C7" }]}>
              <Text style={{ fontSize: 17 }}>📅</Text>
            </View>
            <View style={s.rowText}>
              <Text style={s.rowLabel}>{t.date}</Text>
              <Text style={[s.rowValue, !date && s.rowPlaceholder]}>
                {date || t.selectDate}
              </Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>

          {/* ── DEPARTURE TIME ── */}
          <Text style={s.timeLabel}>⏰ {t.departureTime}</Text>

          {/* No cities yet → show fixed slots as default */}
          {!citiesChosen && (
            <View style={s.timeRow}>
              {[
                { k: "08:00" as const, l: t.dayTravel,   d: t.dayDesc   },
                { k: "19:00" as const, l: t.nightTravel, d: t.nightDesc },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.k}
                  style={[s.timeCard, fixedTime === opt.k && s.timeCardOn]}
                  onPress={() => setFixedTime(opt.k)}
                  activeOpacity={0.8}
                >
                  <Text style={s.timeCardLabel}>{opt.l}</Text>
                  <Text style={[s.timeCardTime, fixedTime === opt.k && { color: "#fff" }]}>{opt.k}</Text>
                  <Text style={[s.timeCardDesc, fixedTime === opt.k && { color: "#DDD6FE" }]}>{opt.d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Long route ≥ 6h → fixed 08:00 / 19:00 */}
          {isLong && (
            <>
              <View style={s.routeHint}>
                <Text style={s.routeHintText}>
                  🛣️ {from} → {to}: ~{routeHours}h — fixed departure times apply
                </Text>
              </View>
              <View style={s.timeRow}>
                {[
                  { k: "08:00" as const, l: t.dayTravel,   d: t.dayDesc   },
                  { k: "19:00" as const, l: t.nightTravel, d: t.nightDesc },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.k}
                    style={[s.timeCard, fixedTime === opt.k && s.timeCardOn]}
                    onPress={() => { setFixedTime(opt.k); setCustomTime(null); }}
                    activeOpacity={0.8}
                  >
                    <Text style={s.timeCardLabel}>{opt.l}</Text>
                    <Text style={[s.timeCardTime, fixedTime === opt.k && { color: "#fff" }]}>{opt.k}</Text>
                    <Text style={[s.timeCardDesc, fixedTime === opt.k && { color: "#DDD6FE" }]}>{opt.d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Short route < 6h → custom time picker */}
          {isShort && (
            <>
              <View style={[s.routeHint, { backgroundColor: "#ECFDF5", borderColor: "#D1FAE5" }]}>
                <Text style={[s.routeHintText, { color: "#065F46" }]}>
                  🛣️ {from} → {to}: ~{routeHours}h — {t.shortTripNote}
                </Text>
              </View>
              <TouchableOpacity style={s.customBtn} onPress={() => setShowTime(true)} activeOpacity={0.8}>
                <Text style={{ fontSize: 20 }}>🕐</Text>
                <Text style={s.customBtnText}>
                  {customTime ? `Departure: ${customTime}` : t.customTime}
                </Text>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Validation error */}
          {!!searchError && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>⚠️ {searchError}</Text>
            </View>
          )}

          {/* SEARCH BUTTON */}
          <TouchableOpacity style={s.searchBtn} onPress={() => {
  if (!from || !to) {
    setSearchError("Please choose departure and destination.");
    return;
  }
  setSearchError("");
  const time = isLong ? (fixedTime ?? "") : (customTime ?? "");
  router.push({ pathname: "/search-results", params: { from, to, date, time } });
}} activeOpacity={0.85}>
            <Text style={s.searchBtnText}>🔍  {t.searchBuses}</Text>
          </TouchableOpacity>
        </View>

        {/* ── POPULAR ROUTES ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t.popularRoutes}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            {POPULAR_ROUTES.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={s.pill}
                onPress={() => { setFrom(r.from); setTo(r.to); setSearchError(""); }}
                activeOpacity={0.75}
              >
                <Text style={s.pillRoute}>{r.from} → {r.to}</Text>
                <Text style={s.pillMeta}>{r.duration} · {r.price}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── AGENCIES ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t.busAgencies}</Text>
          <Text style={s.sectionSub}>{t.scrollAgencies}</Text>

          {AGENCIES.filter(a => !a.cross).map((a, i) => (
            <AgencyCard key={i} item={a} />
          ))}

          <View style={s.intlSep}>
            <View style={s.intlSepLine} />
            <Text style={s.intlSepLabel}>🌍 {t.international}</Text>
            <View style={s.intlSepLine} />
          </View>

          {AGENCIES.filter(a => a.cross).map((a, i) => (
            <AgencyCard key={i} item={a} />
          ))}
        </View>

        {/* ── PACKAGE BANNER ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t.sendPackage}</Text>
          <View style={s.pkgBanner}>
            <View style={{ flex: 1 }}>
              <Text style={s.pkgTitle}>{t.shipCities}</Text>
              <Text style={s.pkgDesc}>{t.shipDesc}</Text>
              <TouchableOpacity style={s.pkgBtn}>
                <Text style={s.pkgBtnText}>{t.explore}</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 52, marginLeft: 12 }}>📦</Text>
          </View>
        </View>

        <View style={{ height: 36 }} />
      </ScrollView>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  content: { paddingBottom: 20 },

  header: {
    backgroundColor: PURPLE_DARK,
    paddingTop: Platform.OS === "android" ? 52 : 64,
    paddingHorizontal: 24,
    paddingBottom: 52,
    overflow: "hidden",
    position: "relative",
  },
  headerRow: { flexDirection: "row", alignItems: "flex-start" },
  greet:  { fontSize: 13, color: "#C4B5FD", fontWeight: "600" },
  brand:  { fontSize: 38, fontWeight: "900", color: "#fff", letterSpacing: -1.2, marginTop: 2 },
  sub:    { fontSize: 12, color: "#A78BFA", marginTop: 4, fontWeight: "500" },
  busBadge: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  circle1: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "#7C3AED", opacity: 0.22, right: -50, bottom: -70 },
  circle2: { position: "absolute", width: 120, height: 120, borderRadius: 60,  backgroundColor: "#A78BFA", opacity: 0.15, right: 50,  bottom: -20 },

  card: {
    backgroundColor: CARD, borderRadius: 28,
    marginHorizontal: 16, marginTop: -26, padding: 20,
    shadowColor: PURPLE_DARK,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14, shadowRadius: 24, elevation: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: "800", color: TEXT_C, marginBottom: 16 },

  row: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FAFAFA", borderRadius: 16, padding: 12,
    borderWidth: 1.5, borderColor: BORDER, marginBottom: 2,
  },
  rowIcon:        { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  rowText:        { flex: 1 },
  rowLabel:       { fontSize: 10, fontWeight: "800", color: PURPLE, letterSpacing: 1, textTransform: "uppercase" },
  rowValue:       { fontSize: 15, color: TEXT_C, fontWeight: "600", marginTop: 2 },
  rowPlaceholder: { color: "#C4B5FD", fontWeight: "400" },
  chevron:        { fontSize: 22, color: "#C4B5FD" },
  intlTag:        { backgroundColor: "#ECFDF5", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, marginRight: 6 },
  intlTagText:    { fontSize: 12 },

  swapRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  swapLine: { flex: 1, height: 1, backgroundColor: BORDER },
  swapBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: PURPLE,
    alignItems: "center", justifyContent: "center",
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },

  timeLabel:    { fontSize: 13, fontWeight: "800", color: TEXT_C, marginTop: 16, marginBottom: 10 },
  timeRow:      { flexDirection: "row", gap: 10 },
  timeCard:     { flex: 1, borderRadius: 16, padding: 14, backgroundColor: "#F5F3FF", borderWidth: 2, borderColor: BORDER },
  timeCardOn:   { backgroundColor: PURPLE_DARK, borderColor: PURPLE },
  timeCardLabel:{ fontSize: 12, fontWeight: "700", color: TEXT_C, marginBottom: 4 },
  timeCardTime: { fontSize: 22, fontWeight: "900", color: PURPLE, letterSpacing: -0.5 },
  timeCardDesc: { fontSize: 10, color: MUTED, marginTop: 4, lineHeight: 14 },

  routeHint:     { backgroundColor: "#EDE9FE", borderRadius: 12, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: BORDER },
  routeHintText: { fontSize: 12, color: PURPLE, fontWeight: "600" },

  customBtn:     { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F3FF", borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: BORDER, gap: 10 },
  customBtnText: { flex: 1, fontSize: 15, fontWeight: "700", color: TEXT_C },

  errorBox: {
    marginTop: 12, backgroundColor: "#FEF2F2", borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: "#FECACA",
  },
  errorText: { fontSize: 13, color: "#DC2626", fontWeight: "600" },

  searchBtn: {
    marginTop: 18, backgroundColor: PURPLE_DARK, borderRadius: 18,
    paddingVertical: 17, alignItems: "center",
    shadowColor: PURPLE_DARK, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  searchBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },

  section:      { paddingHorizontal: 16, marginTop: 28 },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: TEXT_C, letterSpacing: -0.4, marginBottom: 2 },
  sectionSub:   { fontSize: 12, color: MUTED, marginBottom: 12, fontWeight: "500" },

  pill: {
    backgroundColor: CARD, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    marginRight: 10, borderWidth: 1.5, borderColor: BORDER, minWidth: 190,
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  pillRoute: { fontSize: 14, fontWeight: "700", color: TEXT_C },
  pillMeta:  { fontSize: 11, color: PURPLE, fontWeight: "600", marginTop: 4 },

  intlSep:      { flexDirection: "row", alignItems: "center", marginVertical: 18, gap: 10 },
  intlSepLine:  { flex: 1, height: 1, backgroundColor: BORDER },
  intlSepLabel: { fontSize: 12, fontWeight: "800", color: GREEN },

  pkgBanner: {
    backgroundColor: PURPLE_DARK, borderRadius: 22, padding: 22,
    flexDirection: "row", alignItems: "center",
    shadowColor: PURPLE_DARK, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 14, elevation: 7,
  },
  pkgTitle: { fontSize: 18, fontWeight: "900", color: "#fff", letterSpacing: -0.4 },
  pkgDesc:  { fontSize: 12, color: "#C4B5FD", marginTop: 6, lineHeight: 18, fontWeight: "500" },
  pkgBtn:   { marginTop: 14, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, alignSelf: "flex-start" },
  pkgBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
});

const ag = StyleSheet.create({
  card: {
    backgroundColor: CARD, borderRadius: 20, padding: 16,
    flexDirection: "row", alignItems: "flex-start",
    marginBottom: 12, overflow: "hidden", position: "relative",
    borderWidth: 1, borderColor: BORDER,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  accent:   { position: "absolute", left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
  iconWrap: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 12, marginLeft: 8 },
  info:     { flex: 1 },
  nameRow:  { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 2 },
  name:     { fontSize: 15, fontWeight: "800", color: TEXT_C, flexShrink: 1 },
  badge:    { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText:{ fontSize: 10, fontWeight: "800" },
  desc:     { fontSize: 11, color: MUTED, fontWeight: "500", marginBottom: 2 },
  chip:     { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, borderWidth: 1 },
  chipText: { fontSize: 11, fontWeight: "700" },
  footer:   { flexDirection: "row", alignItems: "center", marginTop: 8, flexWrap: "wrap" },
  star:     { fontSize: 12, fontWeight: "700", color: GOLD },
  dot:      { color: BORDER, marginHorizontal: 5, fontSize: 12 },
  seats:    { fontSize: 11, color: MUTED, fontWeight: "500" },
  cross:    { fontSize: 11, color: GREEN, fontWeight: "700" },
});

const cal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  navRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  navBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: PURPLE_LIGHT, alignItems: "center", justifyContent: "center" },
  navArrow:   { fontSize: 24, color: PURPLE, fontWeight: "900", lineHeight: 28 },
  monthLabel: { fontSize: 18, fontWeight: "800", color: TEXT_C },
  dowRow:     { flexDirection: "row", marginBottom: 8 },
  dowLabel:   { flex: 1, textAlign: "center", fontSize: 11, fontWeight: "800", color: PURPLE, textTransform: "uppercase" },
  grid:       { flexDirection: "row", flexWrap: "wrap" },
  cell:       { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 100, marginVertical: 2 },
  cellToday:      { backgroundColor: PURPLE_DARK },
  cellPast:       { opacity: 0.3 },
  cellText:       { fontSize: 14, fontWeight: "600", color: TEXT_C },
  cellTextToday:  { color: "#fff", fontWeight: "900" },
  cellTextPast:   { color: MUTED },
  cancelBtn:  { marginTop: 16, backgroundColor: PURPLE_LIGHT, borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  cancelText: { fontSize: 15, fontWeight: "700", color: PURPLE },
});

const cp = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet:   { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, maxHeight: "85%" },
  handle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  title:   { fontSize: 20, fontWeight: "900", color: TEXT_C, marginBottom: 14 },
  searchBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F5F3FF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1.5, borderColor: BORDER, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: TEXT_C, fontWeight: "500" },
  groupLabel:  { fontSize: 11, fontWeight: "800", color: PURPLE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, marginTop: 8 },
  item:        { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  itemIntl:    { backgroundColor: "#F9FAFB", paddingHorizontal: 8, borderRadius: 10, marginBottom: 2 },
  itemText:    { fontSize: 15, color: TEXT_C, fontWeight: "600" },
  intlBadge:   { backgroundColor: "#ECFDF5", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  intlBadgeText:{ fontSize: 10, color: "#059669", fontWeight: "700" },
  cancelBtn:   { marginTop: 8, marginBottom: Platform.OS === "ios" ? 32 : 16, backgroundColor: "#F5F3FF", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  cancelText:  { fontSize: 15, fontWeight: "700", color: PURPLE },
});

const tp = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 36 : 20,
  },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  title:      { fontSize: 20, fontWeight: "900", color: TEXT_C, marginBottom: 20, textAlign: "center" },
  pickerRow:  { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20, gap: 16 },
  col:        { alignItems: "center", gap: 8 },
  arrow:      { width: 44, height: 44, borderRadius: 22, backgroundColor: PURPLE_LIGHT, alignItems: "center", justifyContent: "center" },
  arrowText:  { fontSize: 16, color: PURPLE, fontWeight: "900" },
  numBox:     { width: 90, height: 70, borderRadius: 18, backgroundColor: PURPLE_DARK, alignItems: "center", justifyContent: "center" },
  numText:    { fontSize: 36, fontWeight: "900", color: "#fff", letterSpacing: -1 },
  colon:      { fontSize: 40, fontWeight: "900", color: PURPLE_DARK, marginTop: -8 },
  quickRow:   { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20, justifyContent: "center" },
  quickBtn:   { backgroundColor: PURPLE_LIGHT, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  quickBtnText:{ fontSize: 13, fontWeight: "700", color: PURPLE },
  confirmBtn: { backgroundColor: PURPLE_DARK, borderRadius: 18, paddingVertical: 16, alignItems: "center", marginBottom: 10 },
  confirmText:{ color: "#fff", fontWeight: "800", fontSize: 16 },
  cancelBtn:  { backgroundColor: PURPLE_LIGHT, borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  cancelText: { fontSize: 15, fontWeight: "700", color: PURPLE },
});