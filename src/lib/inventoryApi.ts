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
  image_url?: string | null;
  slug?: string | null;
  original_price?: number | null; // Added original_price
  currency?: string | null; // Added currency
  discount_percentage?: number | null; // Added discount_percentage (0-100)
}

// Type for data needed to add/update from the form
// Excludes calculated fields (sale_price) and auto-generated fields (id, created_at, slug)
export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'slug' | 'sale_price'>;

// Helper function to calculate sale price
const calculateSalePrice = (originalPrice?: number | null, discountPercentage?: number | null): number => {
    const origPrice = originalPrice ?? 0; // Default to 0 if null/undefined
    const discount = discountPercentage ?? 0; // Default to 0 if null/undefined

    if (origPrice > 0 && discount > 0 && discount <= 100) {
        return parseFloat((origPrice * (1 - discount / 100)).toFixed(2)); // Calculate and round to 2 decimal places
    }
    // If no discount or no original price, sale price is the original price (or 0)
    return parseFloat(origPrice.toFixed(2));
};


// --- Slug Generation Utility ---
// Exporting so it can be used elsewhere (e.g., for category slugs in links)
export const generateSlug = (name: string): string => {
  if (!name) return ''; // Handle empty name case

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters (excluding space and hyphen)
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, hyphens with a single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  return slug;
};

// Helper to check slug uniqueness and append number if needed
const findUniqueSlug = async (baseSlug: string, currentProductId?: number): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    let query = supabase.from('products').select('id').eq('slug', slug);
    // If updating, exclude the current product ID from the check
    if (currentProductId !== undefined) {
      query = query.neq('id', currentProductId);
    }
    const { data, error } = await query.limit(1);

    if (error) {
      console.error('Error checking slug uniqueness:', error);
      throw new Error('Failed to verify slug uniqueness.'); // Or handle differently
    }

    if (!data || data.length === 0) {
      isUnique = true; // Slug is unique
    } else {
      // Slug exists, append counter and try again
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  return slug;
};


// --- Supabase Storage Constants ---
const IMAGE_BUCKET = 'img'; // The name of your public bucket

// --- Image Upload Function ---
export const uploadProductImage = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // Create a unique file path, e.g., using timestamp and original name
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`; // Store directly in the bucket root, or use folders like 'products/'

  const { error: uploadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw new Error('Failed to upload image.');
  }

  // Get the public URL for the uploaded file
  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);

  if (!data?.publicUrl) {
    console.error('Error getting public URL after upload');
    // Attempt to clean up the uploaded file if URL retrieval fails? Maybe not necessary.
    throw new Error('Image uploaded but failed to get public URL.');
  }

  return data.publicUrl;
};

// --- Image Deletion Function ---
// Takes the full public URL and extracts the file path for deletion
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) return; // No image to delete

  try {
    const url = new URL(imageUrl);
    // Assumes the path starts after the bucket name in the URL pathname
    // e.g., /storage/v1/object/public/img/1713234698123.jpg -> img/1713234698123.jpg
    const pathSegments = url.pathname.split('/');
    const bucketNameIndex = pathSegments.findIndex(segment => segment === IMAGE_BUCKET);
    if (bucketNameIndex === -1 || bucketNameIndex + 1 >= pathSegments.length) {
        console.error('Could not extract file path from URL:', imageUrl);
        throw new Error('Invalid image URL format for deletion.');
    }
    // Join the segments after the bucket name
    const filePath = pathSegments.slice(bucketNameIndex + 1).join('/');


    console.log(`Attempting to delete image at path: ${filePath}`); // Debug log

    const { error: deleteError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .remove([filePath]);

    if (deleteError) {
      // It's possible the file doesn't exist (e.g., manual deletion, URL change)
      // Log the error but maybe don't throw if it's a 'Not Found' type error?
      // For now, we'll throw for any deletion error.
      console.error('Error deleting image:', deleteError);
      throw new Error(`Failed to delete image: ${deleteError.message}`);
    }
     console.log(`Successfully deleted image: ${filePath}`); // Success log
  } catch (error) {
    // Catch URL parsing errors or other issues
    console.error('Error processing image deletion:', error);
    // Don't necessarily throw here, maybe the URL was invalid or external
    // Let the calling function decide how to handle this.
    // For now, re-throwing to indicate failure.
    if (error instanceof Error) {
       throw new Error(`Failed to process image deletion: ${error.message}`);
    } else {
       throw new Error('An unknown error occurred during image deletion.');
    }
  }
};


// Fetch all products (including new price fields)
export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, slug, original_price, currency, discount_percentage') // Select all fields
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
  // Ensure data is not null before returning
  return data || [];
};

// Add a new product (calculating sale_price)
export const addProduct = async (formData: ProductFormData): Promise<Product> => {
  // Generate initial slug from name
  const baseSlug = generateSlug(formData.name);
  const uniqueSlug = await findUniqueSlug(baseSlug);

  // Calculate sale price
  const calculatedSalePrice = calculateSalePrice(formData.original_price, formData.discount_percentage);

  const dataToInsert = {
    ...formData,
    slug: uniqueSlug,
    sale_price: calculatedSalePrice, // Add calculated sale price
    // Ensure optional number fields are null if undefined/empty
    original_price: formData.original_price === undefined ? null : formData.original_price,
    discount_percentage: formData.discount_percentage === undefined ? 0 : formData.discount_percentage, // Default discount to 0
    purchase_price: formData.purchase_price === undefined ? null : formData.purchase_price,
    reorder_level: formData.reorder_level === undefined ? null : formData.reorder_level,
  };

  const { data, error } = await supabase
    .from('products')
    .insert([dataToInsert])
    .select('*, slug, original_price, currency, discount_percentage') // Select all fields
    .single();

  if (error) {
    console.error('Error adding product:', error);
    throw new Error('Failed to add product');
  }
  if (!data) {
    throw new Error('Product added but no data returned');
  }
  return data;
};

// Update an existing product (calculating sale_price)
export const updateProduct = async (id: number, formData: Partial<ProductFormData>): Promise<Product> => {
    // Fetch the current product data first to get potentially unchanged price/discount fields
    const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('original_price, discount_percentage')
        .eq('id', id)
        .single();

    if (fetchError || !currentProduct) {
        console.error('Error fetching current product for update:', fetchError);
        throw new Error('Failed to fetch current product data before update.');
    }

    // Determine the values to use for calculation
    const originalPriceForCalc = formData.original_price !== undefined ? formData.original_price : currentProduct.original_price;
    const discountForCalc = formData.discount_percentage !== undefined ? formData.discount_percentage : currentProduct.discount_percentage;

    // Calculate new sale price
    const calculatedSalePrice = calculateSalePrice(originalPriceForCalc, discountForCalc);

    const dataToUpdate: Partial<Product & { slug?: string }> = {
        ...formData,
        sale_price: calculatedSalePrice, // Update with calculated sale price
        quantity_on_hand: formData.quantity_on_hand ?? undefined, // Keep existing if not provided
        // Ensure optional number fields are null if explicitly set to undefined, otherwise keep existing
        original_price: formData.original_price === undefined ? undefined : (formData.original_price ?? null),
        discount_percentage: formData.discount_percentage === undefined ? undefined : (formData.discount_percentage ?? 0),
        purchase_price: formData.purchase_price === undefined ? undefined : (formData.purchase_price ?? null),
        reorder_level: formData.reorder_level === undefined ? undefined : (formData.reorder_level ?? null),
        currency: formData.currency === undefined ? undefined : (formData.currency ?? null),
        image_url: formData.image_url === undefined ? undefined : (formData.image_url ?? null),
        description: formData.description === undefined ? undefined : (formData.description ?? null),
        brand: formData.brand === undefined ? undefined : (formData.brand ?? null),
        category: formData.category === undefined ? undefined : (formData.category ?? null),
    };

    // Handle slug update if name changes
    if (formData.name) {
        const baseSlug = generateSlug(formData.name);
        const uniqueSlug = await findUniqueSlug(baseSlug, id);
        dataToUpdate.slug = uniqueSlug;
    }

    // Remove undefined fields before sending to Supabase
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key as keyof typeof dataToUpdate] === undefined && delete dataToUpdate[key as keyof typeof dataToUpdate]);


    const { data, error } = await supabase
        .from('products')
        .update(dataToUpdate)
        .eq('id', id)
        .select('*, slug, original_price, currency, discount_percentage') // Select all fields
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

// Fetch a single product by its slug (including new price fields)
export const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
  if (!slug) return null;

  const { data, error } = await supabase
    .from('products')
    .select('*, slug, original_price, currency, discount_percentage') // Select all fields
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching product by slug "${slug}":`, error);
    throw new Error('Failed to fetch product details');
  }

  return data; // Returns the product object or null
};


// Delete a product
export const deleteProduct = async (id: number): Promise<void> => {
  // Consider deleting associated image from storage here if needed
  // const productToDelete = await supabase.from('products').select('image_url').eq('id', id).single();
  // if (productToDelete.data?.image_url) { await deleteProductImage(productToDelete.data.image_url); }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
};
