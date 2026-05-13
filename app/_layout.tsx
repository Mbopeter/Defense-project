import { Stack } from "expo-router";
import { LanguageProvider } from "../context/LanguageContext";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="search-results" options={{ headerShown: false, animation: "slide_from_right" }} />
      </Stack>
    </LanguageProvider>
  );
}