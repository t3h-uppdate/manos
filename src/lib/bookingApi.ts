import { supabase } from './supabaseClient';
import { Service } from './serviceApi'; // Assuming Service type is defined here or in a shared types file

// Define the structure of data needed to create a booking
// Adjust based on your actual 'bookings' table columns
export interface NewBookingData {
  service_id?: number | null; // Made optional, assuming backend allows NULL
  staff_id?: number | null; // Allow null for simplified booking
  customer_id: number; // Link to the customer record
  start_time: string; // ISO 8601 format string (e.g., "2025-04-20T10:00:00Z")
  end_time: string;   // ISO 8601 format string
  // client_name, client_email, client_phone are now retrieved via customer_id
  status?: string; // e.g., 'confirmed', 'pending' - default in DB or set here
  message?: string; // Added message field
  // Add any other relevant fields like notes, price_paid etc.
}

// Define the structure of a returned Booking (matching DB)
export interface Booking extends NewBookingData {
    id: number;
    created_at: string;
    // Include other fields returned from DB if needed
}


// Function to create a new booking
export const createBooking = async (bookingData: NewBookingData): Promise<Booking> => {

  // Prepare data for insertion, ensuring all required fields from the interface are present
  // Note: client_name, client_email etc. are NOT directly in bookingData anymore
  const dataToInsert: any = { // Use 'any' temporarily or define a specific insert type
    service_id: bookingData.service_id ?? null, // Default to null if not provided
    staff_id: bookingData.staff_id ?? null, // Default to null if not provided
    customer_id: bookingData.customer_id,
    start_time: bookingData.start_time,
    end_time: bookingData.end_time,
    status: bookingData.status || 'confirmed', // Default to 'confirmed'
    // notes: bookingData.notes // Add if notes are included in NewBookingData
  };

  // Add message only if it exists and is not empty
  if (bookingData.message && bookingData.message.trim() !== '') {
    dataToInsert.message = bookingData.message.trim(); // Add message field if provided
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
