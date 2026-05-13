import { Tabs } from "expo-router";
import { Platform, View, Text, StyleSheet } from "react-native";

const PURPLE_DARK = "#4C1D95";
const PURPLE = "#7C3AED";
const MUTED = "#A78BFA";

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[ti.wrap, focused && ti.wrapActive]}>
      <Text style={ti.emoji}>{emoji}</Text>
      {focused && <Text style={ti.label}>{label}</Text>}
    </View>
  );
}

const ti = StyleSheet.create({
  wrap: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, gap: 6,
  },
  wrapActive: {
    backgroundColor: "#EDE9FE",
  },
  emoji: { fontSize: 20 },
  label: { fontSize: 12, fontWeight: "800", color: PURPLE },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: "#4C1D95",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          height: Platform.OS === "android" ? 70 : 88,
          paddingBottom: Platform.OS === "android" ? 10 : 28,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🚌" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="packages"
        options={{
          title: "Packages",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📦" label="Packages" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}