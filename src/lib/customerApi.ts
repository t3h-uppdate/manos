import { supabase } from './supabaseClient';

// Define the structure of customer data (adjust if your table differs)
export interface Customer {
    id: string; // Changed from number to string for UUID
    created_at?: string;
    auth_user_id?: string | null; // Added to match DB schema
    name: string;
    email: string;
    phone?: string | null;
    // Add other fields if needed
}

// Input data for finding/creating
interface CustomerInput {
    authUserId: string; // Added Supabase Auth User ID
    name: string;
    email: string;
    phone?: string | null;
}

/**
 * Finds a customer by email or authUserId. If not found, creates a new customer.
 * Returns the customer's ID (from the 'customers' table).
 * @param customerData - Object containing authUserId, name, email, and optional phone.
 * @returns The UUID string ID of the found or newly created customer.
 */
export const findOrCreateCustomer = async (customerData: CustomerInput): Promise<string> => {
    const authUserId = customerData.authUserId;
    const email = customerData.email.toLowerCase().trim();
    const name = customerData.name.trim();
    const phone = customerData.phone?.trim() || null;

    if (!authUserId || !email || !name) {
        throw new Error('Auth User ID, Customer name and email are required.');
    }

    // 1. Check if customer exists by auth_user_id OR email (prefer auth_user_id)
    const { data: existingCustomer, error: findError } = await supabase
        .from('customers')
        .select('id')
        .or(`auth_user_id.eq.${authUserId},email.eq.${email}`) // Check both fields
        .limit(1) // Ensure we only get one if both match somehow
        .maybeSingle(); // Use maybeSingle to handle 0 or 1 result

    if (findError) {
        console.error('Error finding customer by authId or email:', findError);
        throw new Error(`Failed to check for existing customer: ${findError.message}`);
    }

    // 2. If customer exists, return their ID
    if (existingCustomer) {
        console.log(`Found existing customer with ID: ${existingCustomer.id}`);
        return existingCustomer.id;
    }

    // 3. If customer does not exist, create them
    console.log(`Creating new customer: ${name} (${email})`);
    const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert([
            {
                auth_user_id: authUserId, // Include auth_user_id
                name: name,
                email: email,
                phone: phone,
                // Add default values for other required fields if any
            },
        ])
        .select('id')
        .single(); // Expecting one row back after insert

    if (createError) {
        console.error('Error creating customer:', createError);
        throw new Error(`Failed to create new customer: ${createError.message}`);
    }

    if (!newCustomer?.id) {
         throw new Error('Failed to create customer or retrieve new ID.');
    }

    console.log(`Created new customer with ID: ${newCustomer.id}`);
    return newCustomer.id;
};
