import React, { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "en" | "fr";

const EN = {
  // Welcome
  welcomeTagline: "Your journey starts here",
  selectLanguage: "Select your language",
  continue: "Continue",
  // Home
  goodMorning: "Good morning 👋",
  whereToday: "Where to today?",
  appSubtitle: "Travel smart across Cameroon & beyond",
  bookSeat: "Book a Seat",
  from: "FROM",
  to: "TO",
  date: "DATE",
  chooseDeparture: "Choose departure city",
  chooseDestination: "Choose destination city",
  selectDate: "Select date",
  departureTime: "Departure Time",
  dayTravel: "🌅 Day Travel",
  nightTravel: "🌙 Night Travel",
  dayDesc: "Morning · arrives ~6h later",
  nightDesc: "Evening · arrives ~6h later",
  customTime: "Custom Time",
  pickTime: "Pick departure time",
  shortTripNote: "Short trip — choose your preferred time",
  searchBuses: "Search Available Buses",
  popularRoutes: "🔥 Popular Routes",
  busAgencies: "🏢 Bus Agencies",
  scrollAgencies: "Scroll to explore all operators",
  sendPackage: "📦 Send a Package",
  shipCities: "Ship Across Cities",
  shipDesc: "Send packages with trusted agencies. Door-to-terminal or terminal-to-terminal.",
  explore: "Explore →",
  domestic: "🇨🇲 Cameroon Cities",
  international: "🌍 International Destinations",
  internat: "International",
  crossBorder: "Cross Border",
  cancel: "Cancel",
  // Time
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
  months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
};

const FR: typeof EN = {
  welcomeTagline: "Votre voyage commence ici",
  selectLanguage: "Choisissez votre langue",
  continue: "Continuer",
  goodMorning: "Bonjour 👋",
  whereToday: "Où allez-vous aujourd'hui ?",
  appSubtitle: "Voyagez intelligemment à travers le Cameroun",
  bookSeat: "Réserver une Place",
  from: "DÉPART",
  to: "ARRIVÉE",
  date: "DATE",
  chooseDeparture: "Choisir la ville de départ",
  chooseDestination: "Choisir la ville d'arrivée",
  selectDate: "Choisir une date",
  departureTime: "Heure de Départ",
  dayTravel: "🌅 Voyage de Jour",
  nightTravel: "🌙 Voyage de Nuit",
  dayDesc: "Matin · arrive ~6h après",
  nightDesc: "Soir · arrive ~6h après",
  customTime: "Heure Personnalisée",
  pickTime: "Choisir l'heure de départ",
  shortTripNote: "Trajet court — choisissez votre heure préférée",
  searchBuses: "Rechercher des Bus Disponibles",
  popularRoutes: "🔥 Trajets Populaires",
  busAgencies: "🏢 Agences de Bus",
  scrollAgencies: "Faites défiler pour voir tous les opérateurs",
  sendPackage: "📦 Envoyer un Colis",
  shipCities: "Expédition entre Villes",
  shipDesc: "Envoyez des colis avec des agences de confiance.",
  explore: "Explorer →",
  domestic: "🇨🇲 Villes du Cameroun",
  international: "🌍 Destinations Internationales",
  internat: "International",
  crossBorder: "Transfrontalier",
  cancel: "Annuler",
  mon: "Lun", tue: "Mar", wed: "Mer", thu: "Jeu", fri: "Ven", sat: "Sam", sun: "Dim",
  months: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
};

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof EN;
}

const LanguageContext = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: EN,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: lang === "en" ? EN : FR }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);