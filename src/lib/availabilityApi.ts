import { supabase } from './supabaseClient';
// Removed date-fns imports as filtering is now done in SQL

// Define the structure for a simple available time slot (start time only)
export interface AvailableSlot {
  datetime: string; // ISO 8601 format string (e.g., "2025-04-20T10:00:00Z")
}

// Operating Hours Types and filtering logic removed, now handled by the SQL function.

/**
 * Fetches available time slots for a given service within a specified date range.
 *
 * NOTE: This is a complex query/function. The actual implementation might involve:
 * 1. Generating potential time slots based on opening hours and service duration.
 * 2. Querying staff schedules/availability for the given service/date range.
 * 3. Querying existing bookings to exclude conflicting times.
 * 4. Combining this information to determine truly available slots.
 * This might be best implemented as a Supabase Database Function (RPC) for performance and complexity management.
 *
 * @param serviceId The ID of the service being booked.
 * @param serviceDuration The duration of the service in minutes.
 * @param targetDate The specific date for which to fetch availability.
 * @returns A promise that resolves to an array of simple available slots (datetime only).
 */
export const fetchStaffAvailability = async (
  serviceDuration: number,
  targetDate: Date
): Promise<AvailableSlot[]> => { // Return type updated

  // Format the date as 'YYYY-MM-DD' for the SQL function
  const year = targetDate.getFullYear();
  const month = (targetDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = targetDate.getDate().toString().padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  console.log(`Fetching availability via RPC for duration ${serviceDuration} min on ${formattedDate}`);

  // Call the NEW Supabase RPC function which handles operating hours internally
  const { data, error } = await supabase.rpc('get_available_slots_with_hours', {
    p_service_duration_minutes: serviceDuration,
    p_target_date: formattedDate,
  });

  if (error) {
    console.error('Error calling get_available_slots_with_hours RPC:', error);
    throw new Error(`Failed to fetch availability: ${error.message}`);
  }

  // The RPC function returns rows with slot_start_time respecting operating hours
  // Map this directly to our AvailableSlot interface
  const availableSlots: AvailableSlot[] = (data || []).map((slot: any) => ({
      datetime: slot.slot_start_time, // Map the returned column name
  }));

  console.log(`Returning ${availableSlots.length} slots for ${formattedDate} from RPC.`);

  return availableSlots; // Return the slots provided by the RPC
};
