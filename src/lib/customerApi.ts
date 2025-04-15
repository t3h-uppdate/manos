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
    name: string;
    email: string;
    phone?: string | null;
}

/**
 * Finds a customer by email. If not found, creates a new customer.
 * Returns the customer's ID.
 * @param customerData - Object containing name, email, and optional phone.
 * @returns The UUID string ID of the found or newly created customer.
 */
export const findOrCreateCustomer = async (customerData: CustomerInput): Promise<string> => {
    const email = customerData.email.toLowerCase().trim();
    const name = customerData.name.trim();
    const phone = customerData.phone?.trim() || null;

    if (!email || !name) {
        throw new Error('Customer name and email are required.');
    }

    // 1. Check if customer exists by email
    const { data: existingCustomer, error: findError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .maybeSingle(); // Use maybeSingle to handle 0 or 1 result without error

    if (findError) {
        console.error('Error finding customer:', findError);
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
