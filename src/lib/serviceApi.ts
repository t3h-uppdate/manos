import { supabase } from './supabaseClient';

// Define the Service type matching the database schema
export interface Service {
  id: number; // Changed from number | undefined as it should always exist when fetched/updated
  created_at?: string;
  name: string;
  description?: string | null;
  duration_minutes: number; // Renamed from duration
  price: number; // Assuming numeric type from DB is handled as number here
  is_active?: boolean | null; // Added
  category?: string | null; // Added
}

// Type for data needed to add/update (excluding id and created_at)
export type ServiceData = Omit<Service, 'id' | 'created_at'>;

// Fetch all services for the admin panel
export const fetchServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('name', { ascending: true }); // Order alphabetically by name

  if (error) {
    console.error('Error fetching services:', error);
    throw new Error('Failed to fetch services');
  }
  // Ensure data is not null before returning, and cast price to number if needed
  // Supabase might return numeric types as strings, adjust if necessary
  return (data || []).map(service => ({
    ...service,
    price: typeof service.price === 'string' ? parseFloat(service.price) : service.price,
  }));
};

// Add a new service
export const addService = async (serviceData: ServiceData): Promise<Service> => {
  // Ensure numeric fields are numbers before sending
  const dataToSend = {
    ...serviceData,
    price: Number(serviceData.price),
    duration_minutes: Number(serviceData.duration_minutes),
  };

  const { data, error } = await supabase
    .from('services')
    .insert([dataToSend])
    .select()
    .single(); // Use .single() as we insert one row

  if (error) {
    console.error('Error adding service:', error);
    throw new Error('Failed to add service');
  }
  if (!data) {
    throw new Error('Service added but no data returned');
  }
  // Cast price back to number if needed upon return
  return {
    ...data,
    price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
  };
};

// Update an existing service
export const updateService = async (id: number, serviceData: Partial<ServiceData>): Promise<Service> => {
   // Create a type-safe object for the update payload
   const dataToUpdate: Partial<ServiceData> = { ...serviceData };
   if (serviceData.price !== undefined) {
       dataToUpdate.price = Number(serviceData.price); // Ensure price is a number
   }
   if (serviceData.duration_minutes !== undefined) {
       dataToUpdate.duration_minutes = Number(serviceData.duration_minutes);
   }

  const { data, error } = await supabase
    .from('services')
    .update(dataToUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating service:', error);
    throw new Error('Failed to update service');
  }
   if (!data) {
    throw new Error('Service updated but no data returned');
  }
  // Cast price back to number if needed upon return
  return {
    ...data,
    price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
  };
};

// Delete a service
export const deleteService = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service:', error);
    throw new Error('Failed to delete service');
  }
};

// Optional: Function to fetch only active services for customer portal
export const fetchActiveServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true) // Filter for active services
    .order('category', { ascending: true }) // Example: order by category then name
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching active services:', error);
    throw new Error('Failed to fetch active services');
  }
  return (data || []).map(service => ({
    ...service,
    price: typeof service.price === 'string' ? parseFloat(service.price) : service.price,
  }));
};
