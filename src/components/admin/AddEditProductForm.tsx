import React, { useState, useEffect, useRef, useMemo } from 'react'; // Added useMemo
import { useTranslation } from 'react-i18next';
// Import ProductFormData instead of ProductData, add calculateSalePrice helper (or import if exported)
import { Product, ProductFormData, addProduct, updateProduct, uploadProductImage, deleteProductImage } from '../../lib/inventoryApi';
import { toast } from 'react-hot-toast';

// Recreate or import calculateSalePrice helper
const calculateSalePrice = (originalPrice?: number | null, discountPercentage?: number | null): number => {
    const origPrice = originalPrice ?? 0;
    const discount = discountPercentage ?? 0;
    if (origPrice > 0 && discount > 0 && discount <= 100) {
        return parseFloat((origPrice * (1 - discount / 100)).toFixed(2));
    }
    return parseFloat(origPrice.toFixed(2));
};

interface AddEditProductFormProps {
  product: Product | null; // Product to edit, or null to add
  onSuccess: (product: Product) => void; // Callback on successful add/edit
  onCancel: () => void; // Callback on cancel
}

const AddEditProductForm: React.FC<AddEditProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  // Use ProductFormData for state type and initialize new fields
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    brand: '',
    category: '',
    purchase_price: undefined,
    original_price: undefined, // Added
    currency: 'USD', // Added - Default to USD
    discount_percentage: 0, // Added - Default to 0
    quantity_on_hand: 0,
    reorder_level: undefined,
    image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false); // State for image upload status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null); // Store the initial image URL when editing

  const isEditing = product !== null;
  // Construct the expected base URL for Supabase storage images
  const supabaseStoragePrefix = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/img/`;

  useEffect(() => {
    if (isEditing && product) {
      // Populate form if editing
      setFormData({
        name: product.name,
        description: product.description ?? '',
        brand: product.brand ?? '',
        category: product.category ?? '',
        purchase_price: product.purchase_price ?? undefined,
        original_price: product.original_price ?? undefined, // Populate original_price
        currency: product.currency ?? 'USD', // Populate currency, default USD
        discount_percentage: product.discount_percentage ?? 0, // Populate discount, default 0
        quantity_on_hand: product.quantity_on_hand,
        reorder_level: product.reorder_level ?? undefined,
        image_url: product.image_url ?? '',
      });
      setInitialImageUrl(product.image_url ?? null);
      setImagePreview(product.image_url ?? null);
      setImageFile(null); // Clear any previous file selection
    } else {
      // Reset form if adding
      setFormData({
        name: '',
        description: '',
        brand: '',
        category: '',
        purchase_price: undefined,
        original_price: undefined, // Reset
        currency: 'USD', // Reset to default
        discount_percentage: 0, // Reset to default
        quantity_on_hand: 0,
        reorder_level: undefined,
        image_url: '',
      });
      setInitialImageUrl(null);
      setImagePreview(null); // Clear preview
      setImageFile(null); // Clear file
    }
     // Clean up object URL on unmount or when preview changes
     return () => {
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
     };
  }, [product, isEditing]); // Removed imagePreview from dependency array to avoid issues

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Handle number inputs specifically
    let processedValue: string | number | undefined = value;
    if (type === 'number') {
        // Allow empty string for optional numbers, otherwise parse
        processedValue = value === '' ? undefined : parseFloat(value);
        // Handle potential NaN if parsing fails (e.g., invalid input)
        if (isNaN(processedValue as number)) {
            processedValue = undefined; // Or keep previous value, or show validation error
        }
         // Ensure discount percentage stays within 0-100
        if (name === 'discount_percentage' && typeof processedValue === 'number') {
            processedValue = Math.max(0, Math.min(100, processedValue));
        }
    }

    // Add type for prev
    setFormData((prev: ProductFormData) => ({
      ...prev,
      [name]: processedValue,
    }));

    // If the image URL input is changed, clear the file input and update preview
    if (name === 'image_url') {
        setImageFile(null);
        setImagePreview(value || null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear the file input visually
        }
         // Clean up old blob URL if exists
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
    }
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    // Clear the URL input field if a file is selected
    // Add type for prev
    setFormData((prev: ProductFormData) => ({ ...prev, image_url: '' }));

    // Clean up previous object URL and set new one
    if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
    }

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(initialImageUrl); // Revert to initial or null if file is deselected
    }
  };

  // Handle image removal
  const handleRemoveImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
     e.preventDefault(); // Prevent form submission if inside form
     const imageUrlToRemove = formData.image_url || initialImageUrl; // Prefer current URL, fallback to initial

     // Clean up blob URL if it exists
     if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
     }

     setImageFile(null);
     setImagePreview(null);
     // Add type for prev
     setFormData((prev: ProductFormData) => ({ ...prev, image_url: '' })); // Clear URL in form data
     if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
     }

     // Optional: Immediately attempt to delete from storage if it's a Supabase URL
     // This provides quicker feedback but might fail if the product update fails later.
     // Consider doing deletion only within handleSubmit for atomicity.
     // For now, we'll just clear the fields and handle deletion in handleSubmit.
     toast.success(t('admin.forms.product.notifications.image_removed_preview')); // Notify user preview is cleared
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation - Check name and quantity. Price validation is now implicit via original_price/discount
    if (!formData.name || formData.quantity_on_hand === undefined || formData.quantity_on_hand < 0) {
       // Consider adding validation for original_price if needed (e.g., must be >= 0 if entered)
      setError(t('admin.forms.product.errors.required_fields', 'Please fill in all required fields (Name, Quantity).'));
      setIsSubmitting(false);
      return;
    }
     // Validate discount percentage (treat undefined as 0 for validation)
     const discountForValidation = formData.discount_percentage ?? 0;
     if (discountForValidation < 0 || discountForValidation > 100) {
        setError(t('admin.forms.product.errors.invalid_discount', 'Discount percentage must be between 0 and 100.'));
        setIsSubmitting(false);
        return;
    }

    let finalImageUrl: string | null = formData.image_url || null; // Start with URL input or null
    let uploadedUrl: string | null = null; // To store URL if we upload a new image
    let imageToDelete: string | null = null; // To store URL of image to delete

    // --- Image Handling Logic ---
    try {
        // 1. Check if a new file was selected
        if (imageFile) {
            setIsUploading(true);
            toast.loading(t('admin.forms.product.notifications.uploading_image'));
            uploadedUrl = await uploadProductImage(imageFile);
            toast.dismiss(); // Dismiss loading toast
            finalImageUrl = uploadedUrl; // Use the newly uploaded URL
            setIsUploading(false);

            // If editing and there was an initial image stored in Supabase, mark it for deletion
            if (isEditing && initialImageUrl && initialImageUrl.startsWith(supabaseStoragePrefix)) {
                imageToDelete = initialImageUrl;
            }
        }
        // 2. Check if the URL changed from the initial one (and no new file was uploaded)
        else if (isEditing && initialImageUrl !== finalImageUrl) {
             // If the initial image was from Supabase and the new URL is different (or empty), mark old one for deletion
             if (initialImageUrl && initialImageUrl.startsWith(supabaseStoragePrefix)) {
                 imageToDelete = initialImageUrl;
             }
        }
        // 3. Check if the image was explicitly removed (finalImageUrl is null/empty, and there was an initial image)
        else if (isEditing && !finalImageUrl && initialImageUrl && initialImageUrl.startsWith(supabaseStoragePrefix)) {
            imageToDelete = initialImageUrl;
        }

        // --- Prepare Product Data for API (using ProductFormData structure) ---
        const dataToSubmit: ProductFormData = {
            name: formData.name,
            description: formData.description || null,
            brand: formData.brand || null,
            category: formData.category || null,
            purchase_price: formData.purchase_price === undefined ? null : formData.purchase_price,
            original_price: formData.original_price === undefined ? null : formData.original_price,
            currency: formData.currency || 'USD', // Default to USD if empty
            discount_percentage: formData.discount_percentage ?? 0,
            quantity_on_hand: formData.quantity_on_hand ?? 0,
            reorder_level: formData.reorder_level === undefined ? null : formData.reorder_level,
            image_url: finalImageUrl,
        };


        // --- Add/Update Product ---
        let resultProduct: Product;
        if (isEditing && product?.id) {
            // Pass the correct type (Partial<ProductFormData>) for update
            resultProduct = await updateProduct(product.id, dataToSubmit);
            toast.success(t('admin.forms.product.notifications.update_success', { name: resultProduct.name }));
        } else {
            // Pass the correct type (ProductFormData) for add
            resultProduct = await addProduct(dataToSubmit);
            toast.success(t('admin.forms.product.notifications.add_success', { name: resultProduct.name }));
        }

        // --- Delete Old Image (if necessary) AFTER successful product update ---
        if (imageToDelete) {
            try {
                await deleteProductImage(imageToDelete);
                toast.success(t('admin.forms.product.notifications.old_image_deleted'));
            } catch (deleteErr) {
                console.error("Failed to delete old image:", deleteErr);
                toast.error(t('admin.forms.product.errors.delete_old_image'));
                // Don't necessarily fail the whole operation, but notify the user
            }
        }

        onSuccess(resultProduct); // Pass the added/updated product back

    } catch (err) {
        const messageKey = isUploading
            ? 'admin.forms.product.errors.upload'
            : (isEditing ? 'admin.forms.product.errors.update' : 'admin.forms.product.errors.add');
        const message = t(messageKey);
        setError(message);
        toast.error(message);
        toast.dismiss(); // Ensure loading toast is dismissed on error
        console.error("Error during product save/image handling:", err);

        // If upload succeeded but product update failed, try to delete the newly uploaded image?
        if (uploadedUrl) {
            console.error("Product save failed after image upload. Attempting to delete uploaded image:", uploadedUrl); // Use console.error
            try {
                await deleteProductImage(uploadedUrl);
                toast.error(t('admin.forms.product.notifications.upload_reverted')); // Use toast.error instead of warn
            } catch (revertErr) {
                console.error("Failed to revert image upload:", revertErr);
                toast.error(t('admin.forms.product.errors.revert_upload')); // Keep as error
            }
        }
    } finally {
        setIsUploading(false);
        setIsSubmitting(false);
        toast.dismiss(); // Ensure loading toast is dismissed
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {/* Title is handled by the Modal component now, no need for h2 here */}
      {/* <h2 className="text-xl font-semibold mb-4">{t(isEditing ? 'admin.inventory.edit_modal_title' : 'admin.inventory.add_modal_title')}</h2> */}

      {error && <div className="text-red-600 bg-red-100 p-3 rounded">{error}</div>} {/* Error message is already translated */}

      {/* Form Fields */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('admin.forms.product.labels.name')} <span className="text-red-500">*</span></label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('admin.forms.product.labels.description')}</label>
        <textarea
          id="description"
          name="description"
          value={formData.description ?? ''}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">{t('admin.forms.product.labels.brand')}</label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand ?? ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">{t('admin.forms.product.labels.category')}</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category ?? ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

       {/* Pricing Section */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-4">
         {/* Currency */}
         <div>
           <label htmlFor="currency" className="block text-sm font-medium text-gray-700">{t('admin.forms.product.labels.currency', 'Currency')}</label>
           <select
             id="currency"
             name="currency"
             value={formData.currency ?? 'USD'}
             onChange={handleChange}
             className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
           >
             <option value="USD">USD ($)</option>
             <option value="SYP">SYP (ل.س)</option>
             {/* Add other currencies if needed */}
           </select>
         </div>
         {/* Original Price */}
         <div>
           <label htmlFor="original_price" className="block text-sm font-medium text-gray-700">{t('admin.forms.product.labels.original_price', 'Original Price')}</label>
           <input
             type="number"
             id="original_price"
             name="original_price"
             value={formData.original_price ?? ''}
             onChange={handleChange}
             step="0.01"
             min="0"
             placeholder={t('admin.forms.product.placeholders.original_price', 'e.g., 19.99')}
             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
           />
            <p className="mt-1 text-xs text-gray-500">{t('admin.forms.product.hints.original_price', 'Regular price before discount. Leave blank if not on sale.')}</p>
         </div>
          {/* Discount Percentage */}
         <div>
           <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-700">{t('admin.forms.product.labels.discount', 'Discount (%)')}</label>
           <input
             type="number"
             id="discount_percentage"
             name="discount_percentage"
             value={formData.discount_percentage ?? ''}
             onChange={handleChange}
             step="0.1" // Allow finer discount steps if needed
             min="0"
             max="100"
             placeholder="0"
             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
           />
         </div>
       </div>
        {/* Calculated Sale Price Display */}
        <div className="mt-2 text-right">
            <span className="text-sm font-medium text-gray-700">{t('admin.forms.product.labels.final_price', 'Final Sale Price:')} </span>
            <span className="text-lg font-bold text-indigo-600">
                {formData.currency === 'SYP' ? 'ل.س' : '$'} {/* Display correct symbol */}
                {useMemo(() => calculateSalePrice(formData.original_price, formData.discount_percentage), [formData.original_price, formData.discount_percentage]).toFixed(2)}
            </span>
        </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
         {/* Purchase Price */}
         <div>
           <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700">{t('admin.forms.product.labels.purchase_price')}</label>
           <input
             type="number"
             id="purchase_price"
             name="purchase_price"
             value={formData.purchase_price ?? ''}
             onChange={handleChange}
             step="0.01"
             min="0"
             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
           />
         </div>
         {/* Quantity */}
        <div>
          <label htmlFor="quantity_on_hand" className="block text-sm font-medium text-gray-700">{t('admin.forms.product.labels.quantity')} <span className="text-red-500">*</span></label>
          <input
            type="number"
            id="quantity_on_hand"
            name="quantity_on_hand"
            value={formData.quantity_on_hand}
            onChange={handleChange}
            required
            step="1"
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="reorder_level" className="block text-sm font-medium text-gray-700">{t('admin.forms.product.labels.reorder_level')}</label>
          <input
            type="number"
            id="reorder_level"
            name="reorder_level"
            value={formData.reorder_level ?? ''} // Use empty string for undefined in input
            onChange={handleChange}
            step="1"
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

       {/* Image Upload/URL Section */}
       <div className="space-y-4 border-t pt-4 mt-4">
         <h3 className="text-lg font-medium text-gray-900">{t('admin.forms.product.labels.image_section_title', 'Product Image')}</h3>

         {/* Image Preview */}
         {imagePreview && (
           <div className="mt-2">
             <img src={imagePreview} alt={t('admin.forms.product.alt.preview', 'Preview')} className="max-h-40 w-auto rounded border" />
           </div>
         )}

         {/* File Upload */}
         <div>
           <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">{t('admin.forms.product.labels.upload_image', 'Upload New Image')}</label>
           <input
             type="file"
             id="imageFile"
             name="imageFile"
             ref={fileInputRef}
             onChange={handleFileChange}
             accept="image/png, image/jpeg, image/gif, image/webp" // Specify acceptable image types
             className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
             disabled={isSubmitting || isUploading}
           />
           <p className="mt-1 text-xs text-gray-500">{t('admin.forms.product.labels.upload_hint', 'Overrides the URL below if selected.')}</p>
         </div>

         {/* OR Separator */}
         <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
                <span className="bg-white px-2 text-sm text-gray-500">{t('common.or', 'OR')}</span>
            </div>
         </div>


         {/* Image URL Input */}
         <div>
           <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">{t('admin.forms.product.labels.image_url', 'Image URL')}</label>
           <input
             type="url"
             id="image_url"
             name="image_url"
             value={formData.image_url ?? ''}
             onChange={handleChange}
             placeholder={t('admin.forms.product.placeholders.image_url', 'https://example.com/image.jpg')}
             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
             disabled={isSubmitting || isUploading || !!imageFile} // Disable if uploading or file selected
           />
         </div>

         {/* Remove Image Button */}
         {(imagePreview || imageFile) && (
            <div className="mt-2">
                <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting || isUploading}
                    className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                    {t('admin.forms.product.buttons.remove_image', 'Remove Image')}
                </button>
            </div>
         )}
       </div>


      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting || isUploading}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isUploading && <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />} {/* Add spinner */}
          {isSubmitting || isUploading ? t('common.saving') : (isEditing ? t('admin.forms.product.buttons.update') : t('admin.forms.product.buttons.add'))}
        </button>
      </div>
    </form>
  );
};

// Simple spinner component (can be moved to a shared components file)
const LoadingSpinner: React.FC<{ className?: string }> = ({ className = "h-5 w-5 text-indigo-600" }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export default AddEditProductForm;
