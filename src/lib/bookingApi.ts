import { supabase } from './supabaseClient';

// Define the structure of data needed to create a booking
// Adjust based on your actual 'bookings' table columns
export interface NewBookingData {
  service_id?: number | null; // bigint maps to number okay here
  staff_id?: number | null; // bigint maps to number okay here
  customer_id: string; // Changed to string for UUID
  start_time: string; // ISO 8601 format string (e.g., "2025-04-20T10:00:00Z")
  end_time: string;   // ISO 8601 format string
  status?: string; // e.g., 'confirmed', 'pending' - default in DB or set here
  message?: string | null; // Added message field
  notes?: string | null; // Added notes field to match DB
}

// Define the structure of a returned Booking (matching DB)
export interface Booking extends NewBookingData {
    id: string; // Changed to string for UUID
    created_at: string;
}

// Define an interface for the data structure used for insertion
interface BookingInsertData {
  service_id: number | null;
  staff_id: number | null;
  customer_id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  message?: string | null; // Optional message field
}


// Function to create a new booking
export const createBooking = async (bookingData: NewBookingData): Promise<Booking> => {

  // Prepare data for insertion, ensuring all required fields from the interface are present
  // Note: client_name, client_email etc. are NOT directly in bookingData anymore
  const dataToInsert: BookingInsertData = { // Use the specific insert type
    service_id: bookingData.service_id ?? null, // Default to null if not provided
    staff_id: bookingData.staff_id ?? null, // Default to null if not provided
    customer_id: bookingData.customer_id,
    start_time: bookingData.start_time,
    end_time: bookingData.end_time,
    status: bookingData.status || 'confirmed', // Explicitly setting status, overrides DB default 'pending'
    notes: bookingData.notes ?? null // Add notes if provided, else null
  };

  // Add message only if it exists and is not empty or null
  if (bookingData.message && bookingData.message.trim() !== '') {
    dataToInsert.message = bookingData.message.trim();
  } else {
    dataToInsert.message = null; // Ensure it's set to null if empty/not provided
  }
  const { data, error } = await supabase
    .from('bookings')
    .insert([dataToInsert])
    .select()
    .single(); // Expecting a single row back

  if (error) {
    console.error('Error creating booking:', error);
    // Provide more specific error feedback if possible
    if (error.code === '23505') { // Example: Unique constraint violation
        throw new Error('This time slot seems to have just been booked. Please select another time.');
    }
    throw new Error('Failed to create booking. Please try again.');
  }
  if (!data) {
    throw new Error('Booking created but no data returned');
  }
  return data;
};

 // TODO: Add function to fetch availability (fetchStaffAvailability)
 // This will be more complex, involving staff schedules, existing bookings, service duration etc.
 // Example signature:
 // export const fetchStaffAvailability = async (serviceId: number, dateRangeStart: Date, dateRangeEnd: Date): Promise<AvailableSlot[]> => { ... }

 // Define a more detailed Booking type for fetching, including related data
 export interface DetailedBooking extends Booking {
    services?: { name: string } | null; // Join service name
    staff?: { name: string } | null; // Join staff name
 }

 // Function to fetch bookings for a specific customer ID
 export const fetchBookingsByCustomerId = async (customerId: string): Promise<DetailedBooking[]> => { // Changed customerId to string
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services ( name ),
        staff ( name )
      `)
      .eq('customer_id', customerId)
      .order('start_time', { ascending: false }); // Order by most recent first

    if (error) {
      console.error('Error fetching customer bookings:', error);
      throw new Error('Failed to fetch your bookings.');
    }

    return data || [];
 };
