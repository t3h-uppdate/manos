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

// Interface for staff-service assignments
export interface StaffService {
  staff_id: number;
  service_id: number;
  created_at?: string;
}

// Extend Staff interface to include services
export interface StaffWithServices extends Staff {
  services?: number[];
}

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

// Modify fetchStaff to include services
export const fetchStaffWithServices = async (): Promise<StaffWithServices[]> => {
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('*')
    .order('name', { ascending: true });

  if (staffError) {
    console.error('Error fetching staff:', staffError);
    throw new Error('Failed to fetch staff');
  }

  // Fetch all staff-service relationships
  const { data: staffServices, error: servicesError } = await supabase
    .from('staff_services')
    .select('staff_id, service_id');

  if (servicesError) {
    console.error('Error fetching staff services:', servicesError);
    throw new Error('Failed to fetch staff services');
  }

  // Group services by staff_id
  const servicesByStaff = (staffServices || []).reduce((acc, curr) => {
    acc[curr.staff_id] = acc[curr.staff_id] || [];
    acc[curr.staff_id].push(curr.service_id);
    return acc;
  }, {} as { [key: number]: number[] });

  // Combine staff with their services
  return (staff || []).map(s => ({
    ...s,
    services: servicesByStaff[s.id] || []
  }));
};

// Fetch services assigned to a staff member
export const fetchStaffServices = async (staffId: number): Promise<number[]> => {
  const { data, error } = await supabase
    .from('staff_services')
    .select('service_id')
    .eq('staff_id', staffId);

  if (error) {
    console.error('Error fetching staff services:', error);
    throw new Error('Failed to fetch staff services');
  }
  return (data || []).map(item => item.service_id);
};

// Update services assigned to a staff member
export const updateStaffServices = async (staffId: number, serviceIds: number[]): Promise<void> => {
  const { error: deleteError } = await supabase
    .from('staff_services')
    .delete()
    .eq('staff_id', staffId);

  if (deleteError) {
    console.error('Error deleting existing staff services:', deleteError);
    throw new Error('Failed to update staff services');
  }

  if (serviceIds.length > 0) {
    const { error: insertError } = await supabase
      .from('staff_services')
      .insert(serviceIds.map(serviceId => ({
        staff_id: staffId,
        service_id: serviceId
      })));

    if (insertError) {
      console.error('Error inserting staff services:', insertError);
      throw new Error('Failed to update staff services');
    }
  }
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

// Fetch active staff members who can provide a specific service
export const fetchStaffByService = async (serviceId: number): Promise<Staff[]> => {
  const { data, error } = await supabase
    .from('staff')
    .select(`
      *,
      staff_services!inner(service_id)
    `)
    .eq('staff_services.service_id', serviceId)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching staff for service:', error);
    throw new Error('Failed to fetch staff for service');
  }
  return data || [];
};
