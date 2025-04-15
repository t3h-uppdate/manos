import { supabase } from './supabaseClient';

// Define the Product type matching the database schema and AdminInventory component
// Consider moving this to a shared types file later if used in more places
export interface Product {
  id?: number; // Optional for new products before insertion
  created_at?: string;
  name: string;
  description?: string | null;
  brand?: string | null;
  category?: string | null;
  purchase_price?: number | null;
  sale_price: number;
  quantity_on_hand: number;
  reorder_level?: number | null;
}

// Type for data needed to add/update (excluding id and created_at)
export type ProductData = Omit<Product, 'id' | 'created_at'>;

// Fetch all products
export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true }); // Order alphabetically by name

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
  // Ensure data is not null before returning
  return data || [];
};

// Add a new product
export const addProduct = async (productData: ProductData): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single(); // Use .single() if inserting one row and expecting one back

  if (error) {
    console.error('Error adding product:', error);
    throw new Error('Failed to add product');
  }
  if (!data) {
    throw new Error('Product added but no data returned');
  }
  return data;
};

// Update an existing product
export const updateProduct = async (id: number, productData: Partial<ProductData>): Promise<Product> => {
   // Ensure quantity is a number, default to 0 if null/undefined
   const dataToUpdate = {
    ...productData,
    quantity_on_hand: productData.quantity_on_hand ?? 0,
   };

  const { data, error } = await supabase
    .from('products')
    .update(dataToUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
   if (!data) {
    throw new Error('Product updated but no data returned');
  }
  return data;
};

// Delete a product
export const deleteProduct = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
};
