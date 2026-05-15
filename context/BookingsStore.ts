import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "cb_bookings_v1";

export interface BookingRecord {
  bookingRef: string;
  ticketNumber: string;
  agency: string;
  from: string;
  to: string;
  date: string;
  dep: string;
  arr: string;
  plate: string;
  busClass: string;
  seats: string[];
  price: number;
  totalAmount: number;
  paymentMethod: string;
  bankName?: string;
  // Passenger
  passengerName: string;
  age: string;
  phone: string;
  nationality: string;
  idType: string;
  idNumber: string;
  idImageUri?: string;
  receiptUri?: string;
  busColor: string;
  createdAt: string; // ISO string
  status: "confirmed" | "pending" | "cancelled";
}

export async function saveBooking(record: BookingRecord): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const existing: BookingRecord[] = raw ? JSON.parse(raw) : [];
    // Prepend so newest first
    const updated = [record, ...existing.filter(b => b.bookingRef !== record.bookingRef)];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("BookingsStore.saveBooking error:", e);
  }
}

export async function getAllBookings(): Promise<BookingRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function getBookingsByName(fullName: string): Promise<BookingRecord[]> {
  const all = await getAllBookings();
  const q = fullName.trim().toLowerCase();
  return all.filter(b => b.passengerName.toLowerCase().includes(q));
}

export async function getBookingByRef(ref: string): Promise<BookingRecord | null> {
  const all = await getAllBookings();
  return all.find(b => b.bookingRef === ref || b.ticketNumber === ref) ?? null;
}