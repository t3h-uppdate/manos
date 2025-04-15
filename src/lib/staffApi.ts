import { supabase } from './supabaseClient';

// Define the Staff type matching the database schema
export interface Staff {
  id: number;
  created_at?: string;
  name: string;
  phone?: string | null;
  is_active: boolean;
  bio?: string | null;
}

// Type for data needed to add/update (excluding id and created_at)
export type StaffData = Omit<Staff, 'id' | 'created_at'>;

// Fetch all staff members for the admin panel
export const fetchStaff = async (): Promise<Staff[]> => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('name', { ascending: true }); // Order alphabetically by name

  if (error) {
    console.error('Error fetching staff:', error);
    throw new Error('Failed to fetch staff');
  }
  return data || [];
};

// Add a new staff member
export const addStaff = async (staffData: StaffData): Promise<Staff> => {
  const { data, error } = await supabase
    .from('staff')
    .insert([staffData])
    .select()
    .single(); // Use .single() as we insert one row

  if (error) {
    console.error('Error adding staff member:', error);
    throw new Error('Failed to add staff member');
  }
  if (!data) {
    throw new Error('Staff member added but no data returned');
  }
  return data;
};

// Update an existing staff member
export const updateStaff = async (id: number, staffData: Partial<StaffData>): Promise<Staff> => {
  const { data, error } = await supabase
    .from('staff')
    .update(staffData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating staff member:', error);
    throw new Error('Failed to update staff member');
  }
   if (!data) {
    throw new Error('Staff member updated but no data returned');
  }
  return data;
};

// Delete a staff member (consider implications, maybe just deactivate?)
// For now, implementing actual delete.
export const deleteStaff = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting staff member:', error);
    // Consider more specific error message if delete fails due to constraints (e.g., linked bookings)
    throw new Error('Failed to delete staff member');
  }
};

// Optional: Function to fetch only active staff members (e.g., for assigning to bookings)
export const fetchActiveStaff = async (): Promise<Staff[]> => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('is_active', true) // Filter for active staff
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching active staff:', error);
    throw new Error('Failed to fetch active staff');
  }
  return data || [];
};
