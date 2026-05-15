import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── COLOURS ─────────────────────────────────────────────────────────────────
const BG      = "#F5F3FF";
const CARD    = "#FFFFFF";
const TEXT_C  = "#1E1B4B";
const MUTED   = "#6B7280";
const BORDER  = "#DDD6FE";
const GOLD    = "#F59E0B";
const GREEN   = "#16A34A";
const RED     = "#DC2626";

// ─── AGENCY MASTER DATA ──────────────────────────────────────────────────────
// Image imports must be static – map by name key
const LOGOS: Record<string, any> = {
  "Nso Boys Agency":     require("../assets/images/nso.png"),
  "Musango Agency":      require("../assets/images/musango.png"),
  "Grand Jeannot Express": require("../assets/images/grand_jannot.png"),
  "Moghamo Express":     require("../assets/images/moghamo.png"),
  "Amour Mezam":         require("../assets/images/Amour_Mezam.png"),
  "Vatican Express":     require("../assets/images/vatican.png"),
  "United Express":      require("../assets/images/united.png"),
  "Garanti Express":     require("../assets/images/garanti.png"),
  "Touristique Express": require("../assets/images/touristique.png"),
  "The Peoples Agency":  require("../assets/images/Thepeople.png"),
  "Buca Voyage":         require("../assets/images/buca.png"),
  "Général Express":     require("../assets/images/general.png"),
  "Afrique Con":         require("../assets/images/afriqueCon.png"),
};

type AgencyProfile = {
  color: string;
  badge: string;
  founded: string;
  hq: string;
  fleetSize: string;
  passengers: string;
  slogan: string;
  about: string;
  strengths: string[];
  cities: string[];
  cross: boolean;
  rating: string;
  seats: string;
};

const AGENCY_PROFILES: Record<string, AgencyProfile> = {
  "Nso Boys Agency": {
    color: "#7C3AED",
    badge: "NW Specialist",
    founded: "1998",
    hq: "Bamenda, NW Region",
    fleetSize: "28 buses",
    passengers: "500,000+ yearly",
    slogan: "Born in the highlands, trusted everywhere.",
    about:
      "Nso Boys Agency was founded in 1998 by transport pioneers from the Nso highlands of the North West Region. Over two decades they have grown into one of Cameroon's most trusted inter-city operators, covering the NW corridor all the way to Douala and Yaoundé. Known for punctuality and comfortable 50-seat coaches, they are the go-to choice for travellers heading in and out of Bamenda.",
    strengths: ["Punctual departures", "50-seat comfort coaches", "NW Region experts", "Experienced drivers", "Luggage handling"],
    cities: ["Bamenda","Kumba","Limbé","Buea","Douala","Yaoundé","Mbouda","Bafoussam"],
    cross: false,
    rating: "4.5",
    seats: "50-seat comfort",
  },
  "Musango Agency": {
    color: "#2563EB",
    badge: "Litoral Expert",
    founded: "2005",
    hq: "Douala, Littoral Region",
    fleetSize: "18 buses",
    passengers: "200,000+ yearly",
    slogan: "Connecting the heartbeat cities.",
    about:
      "Musango Agency has been linking Douala, Yaoundé, Limbé and Bafoussam since 2005. A mid-size operator with a loyal customer base, Musango prides itself on clean buses, fair pricing, and reliable schedules on the busy Littoral–Centre–West triangle. Their 45-seat standard coaches are well-maintained and air-conditioned.",
    strengths: ["Clean fleet", "Fair pricing", "Reliable schedules", "AC on all coaches", "Centre & West routes"],
    cities: ["Douala","Yaoundé","Limbé","Bafoussam"],
    cross: false,
    rating: "4.4",
    seats: "45-seat standard",
  },
  "Grand Jeannot Express": {
    color: "#EA580C",
    badge: "Coastal Corridor",
    founded: "2002",
    hq: "Douala, Littoral Region",
    fleetSize: "22 buses",
    passengers: "300,000+ yearly",
    slogan: "Fast lanes, great rides.",
    about:
      "Grand Jeannot Express has built a strong reputation on the coastal corridor connecting Douala, Limbé, Buea and Bamenda since 2002. Their express service targets travellers who want to reach the South West Region quickly and affordably. No-frills but always on time.",
    strengths: ["Express coastal service", "Affordable fares", "SW Region coverage", "On-time record", "Daily departures"],
    cities: ["Bamenda","Douala","Limbé","Buea"],
    cross: false,
    rating: "4.3",
    seats: "40-seat standard",
  },
  "Moghamo Express": {
    color: "#92400E",
    badge: "Dependable",
    founded: "2000",
    hq: "Bamenda, NW Region",
    fleetSize: "20 buses",
    passengers: "250,000+ yearly",
    slogan: "Dependability you can count on.",
    about:
      "Moghamo Express has served the NW and SW regions since 2000. Named after the Moghamo people of the Bamenda highlands, this agency brings a community spirit to intercity travel. Their 48-seat coaches offer a comfortable mix of affordability and reliability, particularly on the Bamenda–Douala and Yaoundé night runs.",
    strengths: ["Night travel specialists", "Community-rooted service", "48-seat coaches", "NW & SW coverage", "Value for money"],
    cities: ["Bamenda","Douala","Yaoundé","Limbé","Buea"],
    cross: false,
    rating: "4.4",
    seats: "48-seat comfort",
  },
  "Amour Mezam": {
    color: "#9333EA",
    badge: "Regional Fave",
    founded: "2008",
    hq: "Bamenda, NW Region",
    fleetSize: "25 buses",
    passengers: "400,000+ yearly",
    slogan: "Travel with love, arrive with joy.",
    about:
      "Amour Mezam — meaning 'Love of Mezam' — is Bamenda's favourite bus company. Founded in 2008, they quickly won the hearts of NW travellers with their VIP 50-seat coaches, premium amenities and warm hospitality. Their WiFi-enabled buses are the most popular choice for the Bamenda–Yaoundé corridor and coastal routes.",
    strengths: ["VIP 50-seat coaches", "WiFi & USB on board", "Snacks service", "Top-rated hospitality", "Premium experience"],
    cities: ["Bamenda","Yaoundé","Douala","Buea","Limbé"],
    cross: false,
    rating: "4.6",
    seats: "50-seat VIP",
  },
  "Vatican Express": {
    color: "#475569",
    badge: "Reliable",
    founded: "2003",
    hq: "Yaoundé, Centre Region",
    fleetSize: "24 buses",
    passengers: "350,000+ yearly",
    slogan: "Safe passage, every time.",
    about:
      "Vatican Express has been a cornerstone of inter-city travel since 2003. Headquartered in Yaoundé, they serve all major corridors with a no-compromise approach to safety and reliability. Their 45-seat comfort coaches undergo rigorous maintenance checks, and drivers are professionally trained and licensed.",
    strengths: ["Safety-first culture", "Professionally trained drivers", "45-seat comfort coaches", "Rigorous maintenance", "Wide route network"],
    cities: ["Bamenda","Douala","Limbé","Yaoundé","Buea"],
    cross: false,
    rating: "4.5",
    seats: "45-seat comfort",
  },
  "United Express": {
    color: "#0891B2",
    badge: "Corridor King",
    founded: "2010",
    hq: "Douala, Littoral Region",
    fleetSize: "30 buses",
    passengers: "600,000+ yearly",
    slogan: "Ruling the Douala–Yaoundé highway.",
    about:
      "United Express is the undisputed king of the Douala–Yaoundé expressway. Launched in 2010, they have invested in the most modern luxury coaches in Cameroon — 60-seat behemoths with full AC, WiFi, USB charging and reclining seats. Multiple daily departures ensure you are never stuck waiting. Rated 4.7 by over 10,000 passengers.",
    strengths: ["60-seat luxury coaches", "Multiple daily runs", "WiFi & USB charging", "Reclining seats", "Highest passenger rating"],
    cities: ["Douala","Yaoundé"],
    cross: false,
    rating: "4.7",
    seats: "60-seat luxury",
  },
  "Garanti Express": {
    color: "#DC2626",
    badge: "Budget Pick",
    founded: "2007",
    hq: "Yaoundé, Centre Region",
    fleetSize: "16 buses",
    passengers: "280,000+ yearly",
    slogan: "Big savings, real comfort.",
    about:
      "Garanti Express is Cameroon's top budget travel choice. Since 2007, they have made intercity travel accessible to all with fares that are consistently 20–30 % cheaper than competitors. Their 40-seat standard fleet is clean and well-maintained — proof that affordable does not mean uncomfortable.",
    strengths: ["Lowest fares in class", "Clean standard fleet", "Wide city coverage", "Frequent departures", "Great value"],
    cities: ["Bamenda","Douala","Limbé","Yaoundé","Buea"],
    cross: false,
    rating: "4.3",
    seats: "40-seat standard",
  },
  "Touristique Express": {
    color: "#16A34A",
    badge: "Top Rated",
    founded: "2012",
    hq: "Yaoundé, Centre Region",
    fleetSize: "35 buses",
    passengers: "700,000+ yearly",
    slogan: "North Cameroon's finest traveller.",
    about:
      "Touristique Express is the premier operator for northern Cameroon routes. Founded in 2012, they have pioneered luxury travel on the Yaoundé–Ngaoundéré, Garoua and Maroua corridors — journeys that require a higher level of on-board comfort. Their 60-seat luxury coaches feature AC, WiFi, snack service and USB ports, making long hauls feel effortless.",
    strengths: ["Best for long-haul North routes", "In-coach snack service", "60-seat luxury fleet", "WiFi & USB", "Highest overall rating 4.7"],
    cities: ["Yaoundé","Douala","Ngaoundéré","Garoua","Maroua"],
    cross: false,
    rating: "4.7",
    seats: "60-seat luxury",
  },
  "The Peoples Agency": {
    color: "#DB2777",
    badge: "Community First",
    founded: "2009",
    hq: "Bamenda, NW Region",
    fleetSize: "14 buses",
    passengers: "180,000+ yearly",
    slogan: "For the people, by the people.",
    about:
      "The Peoples Agency lives by its name. Founded in 2009 by a collective of Bamenda entrepreneurs, this agency has always put the community first — affordable fares, friendly staff, and a welcoming atmosphere on every bus. Serving Bamenda, Yaoundé and Douala with consistent 45-seat standard coaches.",
    strengths: ["Community-owned", "Friendly atmosphere", "Affordable fares", "Bamenda hub", "Reliable daily service"],
    cities: ["Bamenda","Yaoundé","Douala"],
    cross: false,
    rating: "4.2",
    seats: "45-seat standard",
  },
  "Buca Voyage": {
    color: "#CA8A04",
    badge: "West & Centre",
    founded: "2011",
    hq: "Bafoussam, West Region",
    fleetSize: "28 buses",
    passengers: "450,000+ yearly",
    slogan: "Explore the West, in total comfort.",
    about:
      "Buca Voyage is the specialist for Cameroon's West and Centre regions, covering routes that many operators ignore: Dschang, Foumban, Nkongsamba, Bafang and Mbouda alongside the major cities. Founded in 2011, they operate 55-seat VIP coaches with USB charging and AC, making them the top pick for business and leisure travellers in the western highlands.",
    strengths: ["West Region specialists", "55-seat VIP coaches", "USB & AC on board", "Rare city coverage", "Business travel ready"],
    cities: ["Douala","Yaoundé","Bafoussam","Dschang","Foumban","Nkongsamba","Bafang","Mbouda"],
    cross: false,
    rating: "4.6",
    seats: "55-seat VIP",
  },
  "Général Express": {
    color: "#1D4ED8",
    badge: "Most Popular",
    founded: "1995",
    hq: "Yaoundé, Centre Region",
    fleetSize: "45 buses",
    passengers: "1,200,000+ yearly",
    slogan: "Cameroon's number one, since 1995.",
    about:
      "Général Express is Cameroon's largest and most popular bus operator, serving the nation since 1995. With 45 buses and over 1.2 million passengers per year, they cover more cities than any competitor — from Yaoundé and Douala to Bamenda, Bafoussam, Kribi, Ebolowa and Ngaoundéré. Their 70-seat luxury coaches are the benchmark for intercity comfort, and their 4.8 rating speaks for itself.",
    strengths: ["Largest fleet in Cameroon", "70-seat luxury coaches", "Nationwide coverage", "Highest rated agency 4.8", "Most frequent departures"],
    cities: ["Yaoundé","Douala","Bamenda","Bafoussam","Kribi","Ebolowa","Ngaoundéré"],
    cross: false,
    rating: "4.8",
    seats: "70-seat luxury",
  },
  "Afrique Con": {
    color: "#059669",
    badge: "International",
    founded: "2015",
    hq: "Douala, Littoral Region",
    fleetSize: "12 buses",
    passengers: "80,000+ yearly",
    slogan: "Crossing borders, building bridges.",
    about:
      "Afrique Con is Cameroon's leading cross-border operator, running the Douala–Lagos (Nigeria) route since 2015. Their VIP coaches are equipped for international travel: on-board passport check assistance, WiFi, full AC, and USB charging. Each bus is staffed with a bilingual travel attendant who guides passengers through the border crossing process seamlessly.",
    strengths: ["Cross-border specialists", "Passport check assistance", "Bilingual travel attendants", "VIP international coaches", "WiFi & USB on board"],
    cities: ["Douala","Buea","Yaoundé","Ikom (Nigeria)","Lagos (Nigeria)"],
    cross: true,
    rating: "4.5",
    seats: "50-seat VIP",
  },
};

// ─── AGENCY BUSES (subset of ALL_BUSES keyed by agency name) ─────────────────
const AGENCY_BUSES: Record<string, { id: string; from: string; to: string; dep: string; arr: string; price: number; seats: number; total: number; class: string; plate: string; amenities: string[]; }[]> = {
  "Nso Boys Agency": [
    { id: "B014", from: "Yaoundé", to: "Bamenda",  dep: "08:00", arr: "14:00", price: 5500, seats: 12, total: 50, class: "Comfort",  plate: "NW-2201-B", amenities: ["AC","USB"] },
    { id: "B018", from: "Bamenda", to: "Douala",   dep: "08:00", arr: "14:00", price: 5500, seats: 18, total: 50, class: "Comfort",  plate: "NW-2201-B", amenities: ["AC","USB"] },
    { id: "B031", from: "Douala",  to: "Limbé",    dep: "08:00", arr: "09:30", price: 1500, seats: 20, total: 50, class: "Comfort",  plate: "SW-2201-A", amenities: ["AC"] },
  ],
  "Musango Agency": [
    { id: "B024", from: "Douala",  to: "Bafoussam", dep: "10:00", arr: "14:00", price: 4200, seats: 12, total: 45, class: "Comfort", plate: "OU-8821-C", amenities: ["AC","USB"] },
    { id: "MU01", from: "Yaoundé", to: "Douala",   dep: "08:00", arr: "11:30", price: 3200, seats: 22, total: 45, class: "Comfort", plate: "LT-7721-M", amenities: ["AC","USB"] },
    { id: "MU02", from: "Douala",  to: "Limbé",    dep: "10:00", arr: "11:30", price: 1200, seats: 30, total: 45, class: "Standard",plate: "SW-8812-M", amenities: ["AC"] },
  ],
  "Grand Jeannot Express": [
    { id: "B019", from: "Bamenda", to: "Douala",   dep: "08:00", arr: "14:00", price: 5000, seats: 30, total: 40, class: "Standard", plate: "NW-7712-F", amenities: [] },
    { id: "B032", from: "Douala",  to: "Limbé",    dep: "09:00", arr: "10:30", price: 1200, seats: 35, total: 40, class: "Standard", plate: "SW-5512-B", amenities: [] },
    { id: "GJ01", from: "Douala",  to: "Buea",     dep: "08:00", arr: "09:30", price: 1300, seats: 28, total: 40, class: "Standard", plate: "SW-3312-J", amenities: [] },
  ],
  "Moghamo Express": [
    { id: "B016", from: "Yaoundé", to: "Bamenda",  dep: "19:00", arr: "01:00", price: 5500, seats: 25, total: 48, class: "Standard", plate: "NW-3301-D", amenities: ["AC"] },
    { id: "B020", from: "Bamenda", to: "Douala",   dep: "19:00", arr: "01:00", price: 5500, seats: 10, total: 48, class: "Standard", plate: "NW-3301-D", amenities: ["AC"] },
    { id: "MG01", from: "Douala",  to: "Yaoundé",  dep: "08:00", arr: "11:30", price: 3000, seats: 20, total: 48, class: "Standard", plate: "LT-9901-M", amenities: ["AC"] },
  ],
  "Amour Mezam": [
    { id: "B013", from: "Yaoundé", to: "Bamenda",  dep: "08:00", arr: "14:00", price: 6000, seats: 20, total: 50, class: "VIP",      plate: "NW-4421-A", amenities: ["AC","WiFi","USB","Snack"] },
    { id: "B017", from: "Yaoundé", to: "Bamenda",  dep: "19:00", arr: "01:00", price: 6000, seats: 8,  total: 50, class: "VIP",      plate: "NW-5543-E", amenities: ["AC","WiFi","USB"] },
    { id: "B034", from: "Douala",  to: "Limbé",    dep: "14:00", arr: "15:30", price: 1500, seats: 8,  total: 50, class: "VIP",      plate: "SW-1102-D", amenities: ["AC","USB"] },
  ],
  "Vatican Express": [
    { id: "B003", from: "Yaoundé", to: "Douala",   dep: "08:00", arr: "11:30", price: 3200, seats: 22, total: 45, class: "Comfort",  plate: "LT-5567-C", amenities: ["AC","USB"] },
    { id: "B010", from: "Douala",  to: "Yaoundé",  dep: "08:00", arr: "11:30", price: 3200, seats: 28, total: 45, class: "Comfort",  plate: "LT-5567-C", amenities: ["AC","USB"] },
    { id: "B015", from: "Yaoundé", to: "Bamenda",  dep: "08:00", arr: "14:00", price: 5800, seats: 6,  total: 45, class: "Comfort",  plate: "NW-8812-C", amenities: ["AC"] },
    { id: "B033", from: "Douala",  to: "Limbé",    dep: "11:00", arr: "12:30", price: 1400, seats: 15, total: 45, class: "Comfort",  plate: "SW-8821-C", amenities: ["AC","USB"] },
  ],
  "United Express": [
    { id: "B001", from: "Yaoundé", to: "Douala",   dep: "06:00", arr: "09:30", price: 3500, seats: 12, total: 60, class: "VIP",      plate: "LT-9823-A", amenities: ["AC","WiFi","USB"] },
    { id: "B006", from: "Yaoundé", to: "Douala",   dep: "14:00", arr: "17:30", price: 3500, seats: 18, total: 60, class: "VIP",      plate: "LT-3301-F", amenities: ["AC","WiFi","USB"] },
    { id: "B009", from: "Douala",  to: "Yaoundé",  dep: "06:00", arr: "09:30", price: 3500, seats: 10, total: 60, class: "VIP",      plate: "LT-9823-A", amenities: ["AC","WiFi","USB"] },
  ],
  "Garanti Express": [
    { id: "B005", from: "Yaoundé", to: "Douala",   dep: "10:00", arr: "13:30", price: 2800, seats: 30, total: 40, class: "Standard", plate: "CE-8832-E", amenities: [] },
    { id: "B012", from: "Douala",  to: "Yaoundé",  dep: "19:00", arr: "22:30", price: 2800, seats: 20, total: 40, class: "Standard", plate: "CE-8832-E", amenities: [] },
    { id: "B035", from: "Douala",  to: "Limbé",    dep: "16:00", arr: "17:30", price: 1100, seats: 28, total: 40, class: "Standard", plate: "SW-4431-E", amenities: [] },
  ],
  "Touristique Express": [
    { id: "B004", from: "Yaoundé", to: "Douala",   dep: "08:00", arr: "11:30", price: 3800, seats: 8,  total: 60, class: "VIP",      plate: "CE-2201-D", amenities: ["AC","WiFi","Snack"] },
    { id: "B026", from: "Yaoundé", to: "Ngaoundéré",dep:"08:00", arr: "17:00", price: 9000, seats: 14, total: 60, class: "VIP",      plate: "AD-1121-A", amenities: ["AC","WiFi","Snack","USB"] },
    { id: "B028", from: "Yaoundé", to: "Ngaoundéré",dep:"19:00", arr: "04:00", price: 9000, seats: 5,  total: 60, class: "VIP",      plate: "AD-7713-C", amenities: ["AC","WiFi","Snack"] },
  ],
  "The Peoples Agency": [
    { id: "B021", from: "Bamenda", to: "Douala",   dep: "08:00", arr: "14:00", price: 4500, seats: 22, total: 45, class: "Budget",   plate: "NW-9901-G", amenities: [] },
    { id: "TP01", from: "Yaoundé", to: "Douala",   dep: "08:00", arr: "11:30", price: 2600, seats: 30, total: 45, class: "Budget",   plate: "CE-1122-P", amenities: [] },
    { id: "TP02", from: "Douala",  to: "Bamenda",  dep: "19:00", arr: "01:00", price: 4500, seats: 18, total: 45, class: "Budget",   plate: "NW-3344-P", amenities: [] },
  ],
  "Buca Voyage": [
    { id: "B007", from: "Yaoundé", to: "Douala",   dep: "19:00", arr: "22:30", price: 3200, seats: 15, total: 55, class: "VIP",      plate: "CE-7743-G", amenities: ["AC","USB"] },
    { id: "B022", from: "Douala",  to: "Bafoussam", dep:"08:00", arr: "12:00", price: 4000, seats: 24, total: 55, class: "VIP",      plate: "OU-2211-A", amenities: ["AC","USB"] },
    { id: "B025", from: "Douala",  to: "Bafoussam", dep:"19:00", arr: "23:00", price: 4000, seats: 8,  total: 55, class: "VIP",      plate: "OU-3312-D", amenities: ["AC","WiFi","USB"] },
    { id: "BV01", from: "Douala",  to: "Dschang",  dep: "08:00", arr: "13:00", price: 4500, seats: 20, total: 55, class: "VIP",      plate: "OU-5521-B", amenities: ["AC","USB"] },
  ],
  "Général Express": [
    { id: "B002", from: "Yaoundé", to: "Douala",   dep: "07:00", arr: "10:30", price: 3000, seats: 4,  total: 70, class: "Standard", plate: "CE-1145-B", amenities: ["AC"] },
    { id: "B008", from: "Yaoundé", to: "Douala",   dep: "19:00", arr: "22:30", price: 3000, seats: 0,  total: 70, class: "Standard", plate: "LT-6612-H", amenities: ["AC"] },
    { id: "B011", from: "Douala",  to: "Yaoundé",  dep: "08:00", arr: "11:30", price: 3000, seats: 5,  total: 70, class: "Standard", plate: "CE-1145-B", amenities: ["AC"] },
    { id: "B023", from: "Douala",  to: "Bafoussam", dep:"08:00", arr: "12:00", price: 3500, seats: 40, total: 70, class: "Standard", plate: "OU-5543-B", amenities: ["AC"] },
    { id: "B027", from: "Yaoundé", to: "Ngaoundéré",dep:"08:00", arr: "17:00", price: 8000, seats: 22, total: 70, class: "Standard", plate: "AD-4432-B", amenities: ["AC"] },
  ],
  "Afrique Con": [
    { id: "B029", from: "Douala",  to: "Lagos (Nigeria)", dep: "08:00", arr: "16:00", price: 15000, seats: 18, total: 50, class: "VIP", plate: "LT-0012-INT", amenities: ["AC","WiFi","Passport Check","USB"] },
    { id: "B030", from: "Douala",  to: "Lagos (Nigeria)", dep: "19:00", arr: "03:00", price: 15000, seats: 6,  total: 50, class: "VIP", plate: "LT-0013-INT", amenities: ["AC","WiFi","Passport Check"] },
  ],
};

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={[sc.card, { borderColor: color + "30" }]}>
      <Text style={[sc.value, { color }]}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
    </View>
  );
}
const sc = StyleSheet.create({
  card:  { flex: 1, backgroundColor: CARD, borderRadius: 16, padding: 14, alignItems: "center", borderWidth: 1.5, marginHorizontal: 4 },
  value: { fontSize: 18, fontWeight: "900", letterSpacing: -0.5, marginBottom: 2 },
  label: { fontSize: 10, color: MUTED, fontWeight: "600", textAlign: "center" },
});

function BusMiniCard({
  bus,
  color,
  onBook,
}: {
  bus: typeof AGENCY_BUSES["Nso Boys Agency"][0];
  color: string;
  onBook: () => void;
}) {
  const isFull = bus.seats === 0;
  const pct = bus.seats / bus.total;
  const barColor = isFull ? RED : bus.seats <= 5 ? GOLD : color;

  return (
    <View style={[bmc.card, { borderColor: color + "25" }]}>
      <View style={[bmc.accent, { backgroundColor: color }]} />

      {/* Route & time */}
      <View style={bmc.topRow}>
        <View style={bmc.routeBlock}>
          <Text style={bmc.route} numberOfLines={1}>
            {bus.from} → {bus.to}
          </Text>
          <Text style={bmc.time}>{bus.dep} → {bus.arr}</Text>
        </View>
        <View style={bmc.priceBlock}>
          <Text style={[bmc.price, { color }]}>{bus.price.toLocaleString()}</Text>
          <Text style={bmc.cur}>XAF</Text>
        </View>
      </View>

      {/* Class + amenities */}
      <View style={bmc.midRow}>
        <View style={[bmc.classBadge, { backgroundColor: color + "18" }]}>
          <Text style={[bmc.classText, { color }]}>{bus.class}</Text>
        </View>
        <Text style={bmc.plate}>🪪 {bus.plate}</Text>
        <View style={bmc.amenities}>
          {bus.amenities.slice(0, 3).map((a, i) => (
            <View key={i} style={bmc.chip}><Text style={[bmc.chipText, { color }]}>{a}</Text></View>
          ))}
        </View>
      </View>

      {/* Seat bar */}
      <View style={bmc.barRow}>
        <View style={bmc.barTrack}>
          <View style={[bmc.barFill, { width: `${pct * 100}%` as any, backgroundColor: barColor }]} />
        </View>
        <Text style={[bmc.barLabel, { color: barColor }]}>
          {isFull ? "Full" : `${bus.seats} seats`}
        </Text>
      </View>

      {/* Book button */}
      {isFull ? (
        <View style={bmc.fullBadge}><Text style={bmc.fullText}>FULLY BOOKED</Text></View>
      ) : (
        <TouchableOpacity style={[bmc.bookBtn, { backgroundColor: color }]} onPress={onBook} activeOpacity={0.85}>
          <Text style={bmc.bookText}>Book this bus →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const bmc = StyleSheet.create({
  card: {
    backgroundColor: CARD, borderRadius: 18, padding: 14, marginBottom: 12,
    borderWidth: 1.5, overflow: "hidden", position: "relative",
    shadowColor: "#4C1D95", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  accent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 18, borderBottomLeftRadius: 18 },
  topRow: { flexDirection: "row", alignItems: "flex-start", marginLeft: 6, marginBottom: 8 },
  routeBlock: { flex: 1 },
  route: { fontSize: 14, fontWeight: "800", color: TEXT_C },
  time:  { fontSize: 12, color: MUTED, fontWeight: "600", marginTop: 2 },
  priceBlock: { alignItems: "flex-end" },
  price: { fontSize: 18, fontWeight: "900", letterSpacing: -0.5 },
  cur:   { fontSize: 9, color: MUTED, fontWeight: "700" },
  midRow: { flexDirection: "row", alignItems: "center", marginLeft: 6, marginBottom: 8, gap: 6, flexWrap: "wrap" },
  classBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  classText: { fontSize: 10, fontWeight: "800" },
  plate: { fontSize: 10, color: MUTED, fontWeight: "600" },
  amenities: { flexDirection: "row", gap: 4, flex: 1, justifyContent: "flex-end" },
  chip:   { backgroundColor: "#EDE9FE", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  chipText: { fontSize: 9, fontWeight: "700" },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 6, marginBottom: 10 },
  barTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "#EEE", overflow: "hidden" },
  barFill:  { height: 4, borderRadius: 2 },
  barLabel: { fontSize: 10, fontWeight: "800", minWidth: 55, textAlign: "right" },
  bookBtn: { marginLeft: 6, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  bookText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  fullBadge: { marginLeft: 6, backgroundColor: "#FEE2E2", borderRadius: 10, paddingVertical: 8, alignItems: "center" },
  fullText: { color: RED, fontWeight: "900", fontSize: 11, letterSpacing: 0.5 },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function AgencyProfileScreen() {
  const router  = useRouter();
  const params  = useLocalSearchParams<{ name: string }>();
  const name    = decodeURIComponent(params.name ?? "");
  const profile = AGENCY_PROFILES[name];
  const buses   = AGENCY_BUSES[name] ?? [];
  const logo    = LOGOS[name];

  const scrollY = useRef(new Animated.Value(0)).current;

  // Parallax / header opacity
  const headerOpacity = scrollY.interpolate({ inputRange: [0, 120], outputRange: [0, 1], extrapolate: "clamp" });
  const heroBannerTranslate = scrollY.interpolate({ inputRange: [0, 200], outputRange: [0, -60], extrapolate: "clamp" });

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: BG, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 18, color: TEXT_C, fontWeight: "700" }}>Agency not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#7C3AED", fontWeight: "700" }}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const color = profile.color;

  const handleBookBus = (bus: typeof buses[0]) => {
    router.push({
      pathname: "/seat-selection",
      params: {
        busId: bus.id,
        agency: name,
        from: bus.from,
        to: bus.to,
        date: "",
        dep: bus.dep,
        arr: bus.arr,
        plate: bus.plate,
        busClass: bus.class,
        price: String(bus.price),
        color: color.replace("#", "%23"),
        totalSeats: String(bus.total),
        takenSeats: String(bus.total - bus.seats),
        rating: profile.rating,
      },
    });
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={color} />

      {/* Floating sticky header (appears on scroll) */}
      <Animated.View style={[s.stickyHeader, { backgroundColor: color, opacity: headerOpacity }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.stickyTitle} numberOfLines={1}>{name}</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <Animated.ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* ── HERO BANNER ── */}
        <Animated.View style={[s.hero, { backgroundColor: color, transform: [{ translateY: heroBannerTranslate }] }]}>
          {/* Decorative circles */}
          <View style={[s.heroCircle1, { backgroundColor: "#fff", opacity: 0.07 }]} />
          <View style={[s.heroCircle2, { backgroundColor: "#fff", opacity: 0.05 }]} />

          {/* Back button */}
          <TouchableOpacity style={s.heroBack} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>

          {/* Logo + name */}
          <View style={s.heroContent}>
            <View style={s.logoWrap}>
              {logo ? (
                <Image source={logo} style={{ width: 64, height: 64 }} resizeMode="contain" />
              ) : (
                <Text style={{ fontSize: 40 }}>🚌</Text>
              )}
            </View>
            <Text style={s.heroName}>{name}</Text>
            <Text style={s.heroSlogan}>{profile.slogan}</Text>

            <View style={s.heroBadgeRow}>
              {!!profile.badge && (
                <View style={s.heroBadge}>
                  <Text style={s.heroBadgeText}>{profile.badge}</Text>
                </View>
              )}
              {profile.cross && (
                <View style={[s.heroBadge, { backgroundColor: "rgba(16,185,129,0.25)" }]}>
                  <Text style={s.heroBadgeText}>🌍 Cross-border</Text>
                </View>
              )}
              <View style={s.heroRating}>
                <Text style={s.heroRatingText}>⭐ {profile.rating}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── STATS ROW ── */}
        <View style={s.statsRow}>
          <StatCard value={profile.founded}      label="Founded"   color={color} />
          <StatCard value={profile.fleetSize}    label="Fleet Size" color={color} />
          <StatCard value={profile.passengers}   label="Per Year"  color={color} />
        </View>

        {/* ── ABOUT ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionAccent, { backgroundColor: color }]} />
            <Text style={s.sectionTitle}>About the Agency</Text>
          </View>
          <View style={s.aboutCard}>
            <Text style={s.hqLine}>📍 HQ: {profile.hq}</Text>
            <Text style={s.aboutText}>{profile.about}</Text>
          </View>
        </View>

        {/* ── WHY CHOOSE ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionAccent, { backgroundColor: color }]} />
            <Text style={s.sectionTitle}>Why Choose {name.split(" ")[0]}?</Text>
          </View>
          <View style={s.strengthsCard}>
            {profile.strengths.map((str, i) => (
              <View key={i} style={s.strengthRow}>
                <View style={[s.strengthDot, { backgroundColor: color }]} />
                <Text style={s.strengthText}>{str}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── ROUTES COVERED ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionAccent, { backgroundColor: color }]} />
            <Text style={s.sectionTitle}>Cities & Routes</Text>
          </View>
          <View style={s.citiesWrap}>
            {profile.cities.map((city, i) => (
              <View key={i} style={[s.cityChip, { backgroundColor: color + "14", borderColor: color + "35" }]}>
                <Text style={[s.cityChipText, { color }]}>
                  {city.includes("Nigeria") ? "🌍 " : "📍 "}{city}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── AVAILABLE BUSES ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionAccent, { backgroundColor: color }]} />
            <Text style={s.sectionTitle}>Available Buses</Text>
          </View>
          <Text style={s.sectionSub}>Tap "Book this bus" to reserve your seat now</Text>
          {buses.map(bus => (
            <BusMiniCard
              key={bus.id}
              bus={bus}
              color={color}
              onBook={() => handleBookBus(bus)}
            />
          ))}
        </View>

        {/* ── CTA ── */}
        <View style={s.section}>
          <View style={[s.ctaBanner, { backgroundColor: color }]}>
            <View style={s.ctaCircle} />
            <Text style={s.ctaTitle}>Ready to travel with {name.split(" ")[0]}?</Text>
            <Text style={s.ctaSub}>Search routes, pick your seat, and travel with confidence.</Text>
            <TouchableOpacity
              style={s.ctaBtn}
              onPress={() => router.push("/(tabs)")}
              activeOpacity={0.85}
            >
              <Text style={[s.ctaBtnText, { color }]}>Search All Buses →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const HEADER_H = Platform.OS === "ios" ? 54 : 56;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },

  // Sticky floating header
  stickyHeader: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 99,
    height: Platform.OS === "ios" ? 90 : 70,
    paddingTop: Platform.OS === "ios" ? 44 : 24,
    paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center",
  },
  stickyTitle: { flex: 1, color: "#fff", fontWeight: "900", fontSize: 17, textAlign: "center" },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  backArrow: { fontSize: 20, color: "#fff", fontWeight: "900" },

  // Hero banner
  hero: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: 36,
    paddingHorizontal: 24,
    overflow: "hidden",
    position: "relative",
  },
  heroCircle1: {
    position: "absolute", width: 280, height: 280, borderRadius: 140,
    right: -80, top: -60,
  },
  heroCircle2: {
    position: "absolute", width: 160, height: 160, borderRadius: 80,
    left: -40, bottom: -40,
  },
  heroBack: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 20,
  },
  heroContent: { alignItems: "center" },
  logoWrap: {
    width: 90, height: 90, borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 16,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.25)",
  },
  heroName:   { fontSize: 28, fontWeight: "900", color: "#fff", letterSpacing: -0.8, textAlign: "center", marginBottom: 6 },
  heroSlogan: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "500", textAlign: "center", marginBottom: 16, fontStyle: "italic" },
  heroBadgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  heroBadgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  heroRating: {
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  heroRatingText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  // Stats row
  statsRow: {
    flexDirection: "row", marginHorizontal: 12, marginTop: -18,
    marginBottom: 8,
  },

  // Section
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 },
  sectionAccent: { width: 4, height: 22, borderRadius: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: TEXT_C, letterSpacing: -0.4 },
  sectionSub:   { fontSize: 12, color: MUTED, fontWeight: "500", marginBottom: 12, marginTop: -4 },

  // About card
  aboutCard: {
    backgroundColor: CARD, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: BORDER,
    shadowColor: "#4C1D95", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  hqLine: { fontSize: 12, color: MUTED, fontWeight: "700", marginBottom: 10 },
  aboutText: { fontSize: 14, color: TEXT_C, lineHeight: 22, fontWeight: "400" },

  // Strengths
  strengthsCard: {
    backgroundColor: CARD, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: BORDER,
    shadowColor: "#4C1D95", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  strengthRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 12 },
  strengthDot: { width: 10, height: 10, borderRadius: 5 },
  strengthText: { fontSize: 14, color: TEXT_C, fontWeight: "600", flex: 1 },

  // Cities
  citiesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cityChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5 },
  cityChipText: { fontSize: 13, fontWeight: "700" },

  // CTA Banner
  ctaBanner: {
    borderRadius: 24, padding: 24, overflow: "hidden", position: "relative",
    alignItems: "center",
  },
  ctaCircle: {
    position: "absolute", width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)", right: -50, top: -50,
  },
  ctaTitle: { fontSize: 20, fontWeight: "900", color: "#fff", textAlign: "center", letterSpacing: -0.5, marginBottom: 8 },
  ctaSub:   { fontSize: 13, color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 20, marginBottom: 20 },
  ctaBtn:   { backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 28, paddingVertical: 14 },
  ctaBtnText: { fontWeight: "900", fontSize: 15 },
});