import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useLang, Lang } from "../context/LanguageContext";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const { lang, setLang, t } = useLang();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleContinue = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={s.root}>
      {/* Background circles */}
      <View style={s.bgCircle1} />
      <View style={s.bgCircle2} />
      <View style={s.bgCircle3} />

      <Animated.View style={[s.logoSection, { opacity: fadeAnim, transform: [{ scale: logoScale }] }]}>
        {/* Bus icon */}
        <View style={s.busIconWrap}>
          <Text style={s.busIcon}>🚌</Text>
        </View>

        {/* App name */}
        <Text style={s.appName}>CamerBus</Text>
        <Text style={s.tagline}>{t.welcomeTagline}</Text>

        {/* Decorative route line */}
        <View style={s.routeDecor}>
          <View style={s.routeDot} />
          <View style={s.routeLine} />
          <View style={s.routeBus}><Text style={{ fontSize: 14 }}>🚌</Text></View>
          <View style={s.routeLine} />
          <View style={s.routeDot} />
        </View>
      </Animated.View>

      {/* Language selection card */}
      <Animated.View
        style={[
          s.card,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={s.cardTitle}>{t.selectLanguage}</Text>
        <Text style={s.cardSub}>Choisissez votre langue / Select your language</Text>

        <View style={s.langRow}>
          <TouchableOpacity
            style={[s.langBtn, lang === "en" && s.langBtnActive]}
            onPress={() => setLang("en" as Lang)}
            activeOpacity={0.8}
          >
            <Text style={s.langFlag}>🇬🇧</Text>
            <Text style={[s.langLabel, lang === "en" && s.langLabelActive]}>English</Text>
            {lang === "en" && <View style={s.langCheck}><Text style={{ fontSize: 12, color: "#fff" }}>✓</Text></View>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.langBtn, lang === "fr" && s.langBtnActive]}
            onPress={() => setLang("fr" as Lang)}
            activeOpacity={0.8}
          >
            <Text style={s.langFlag}>🇫🇷</Text>
            <Text style={[s.langLabel, lang === "fr" && s.langLabelActive]}>Français</Text>
            {lang === "fr" && <View style={s.langCheck}><Text style={{ fontSize: 12, color: "#fff" }}>✓</Text></View>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={s.continueBtnText}>{t.continue} →</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Version */}
      <Text style={s.version}>v1.0.0 · Cameroon</Text>
    </View>
  );
}

const PURPLE_DARK = "#4C1D95";
const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#EDE9FE";
const BORDER = "#DDD6FE";
const TEXT = "#1E1B4B";

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PURPLE_DARK,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  bgCircle1: {
    position: "absolute", width: 350, height: 350, borderRadius: 175,
    backgroundColor: "#7C3AED", opacity: 0.25, top: -80, right: -80,
  },
  bgCircle2: {
    position: "absolute", width: 250, height: 250, borderRadius: 125,
    backgroundColor: "#A78BFA", opacity: 0.15, bottom: 60, left: -60,
  },
  bgCircle3: {
    position: "absolute", width: 150, height: 150, borderRadius: 75,
    backgroundColor: "#6D28D9", opacity: 0.3, bottom: -30, right: 40,
  },

  logoSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  busIconWrap: {
    width: 100, height: 100, borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.2)",
  },
  busIcon: { fontSize: 52 },
  appName: {
    fontSize: 56,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: "#C4B5FD",
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: 28,
  },
  routeDecor: {
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  routeDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: "#A78BFA",
  },
  routeLine: {
    width: 50, height: 2, backgroundColor: "rgba(167,139,250,0.4)",
  },
  routeBus: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10, padding: 6,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 28,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: TEXT,
    letterSpacing: -0.5,
    marginBottom: 4,
    textAlign: "center",
  },
  cardSub: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  langRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  langBtn: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    borderWidth: 2,
    borderColor: BORDER,
    gap: 6,
    position: "relative",
  },
  langBtnActive: {
    backgroundColor: PURPLE_DARK,
    borderColor: PURPLE_DARK,
  },
  langFlag: { fontSize: 28 },
  langLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: TEXT,
  },
  langLabelActive: { color: "#ffffff" },
  langCheck: {
    position: "absolute",
    top: 10, right: 10,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: PURPLE,
    alignItems: "center", justifyContent: "center",
  },

  continueBtn: {
    backgroundColor: PURPLE_DARK,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: PURPLE_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  continueBtnText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.3,
  },

  version: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 24,
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});