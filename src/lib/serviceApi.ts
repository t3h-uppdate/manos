import { supabase } from './supabaseClient';

// Define the Service type matching the database schema and BookingPortal component
// Consider moving this to a shared types file later
export interface Service {
  id: number;
  created_at?: string;
  name: string;
  description?: string | null;
  duration: number; // Duration in minutes
  price: number;
  is_public?: boolean; // Optional: Flag to control visibility in the portal
  // Add other relevant fields if needed (e.g., category)
}

// Fetch all services (or only public ones if is_public flag exists)
export const fetchPublicServices = async (): Promise<Service[]> => {
  // Adjust the query if you have an 'is_public' flag or similar
  // let query = supabase.from('services').select('*').eq('is_public', true);
  let query = supabase.from('services').select('*'); // Fetch all for now

  query = query.order('name', { ascending: true }); // Order alphabetically by name

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching services:', error);
    throw new Error('Failed to fetch services');
  }
  // Ensure data is not null before returning
  return data || [];
};

// Note: Functions for adding/updating/deleting services likely already exist
// for the admin panel (e.g., in a similar api file or directly in admin components).
// We only need to fetch publicly relevant data here.
