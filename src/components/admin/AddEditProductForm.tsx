import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { Product, ProductData, addProduct, updateProduct } from '../../lib/inventoryApi';
import { toast } from 'react-hot-toast';

interface AddEditProductFormProps {
  product: Product | null; // Product to edit, or null to add
  onSuccess: (product: Product) => void; // Callback on successful add/edit
  onCancel: () => void; // Callback on cancel
}

const AddEditProductForm: React.FC<AddEditProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const { t } = useTranslation(); // Initialize useTranslation
  const [formData, setFormData] = useState<ProductData>({
    name: '',
    description: '',
    brand: '',
    category: '',
    purchase_price: undefined, // Use undefined for optional number fields initially
    sale_price: 0,
    quantity_on_hand: 0,
    reorder_level: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = product !== null;

  useEffect(() => {
    if (isEditing && product) {
      // Populate form if editing
      setFormData({
        name: product.name,
        description: product.description ?? '',
        brand: product.brand ?? '',
        category: product.category ?? '',
        purchase_price: product.purchase_price ?? undefined,
        sale_price: product.sale_price,
        quantity_on_hand: product.quantity_on_hand,
        reorder_level: product.reorder_level ?? undefined,
      });
    } else {
      // Reset form if adding
      setFormData({
        name: '',
        description: '',
        brand: '',
        category: '',
        purchase_price: undefined,
        sale_price: 0,
        quantity_on_hand: 0,
        reorder_level: undefined,
      });
    }
  }, [product, isEditing]);

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
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    if (!formData.name || formData.sale_price === undefined || formData.sale_price < 0 || formData.quantity_on_hand === undefined || formData.quantity_on_hand < 0) {
      setError(t('admin.forms.product.errors.required_fields'));
      setIsSubmitting(false);
      return;
    }

    // Prepare data, ensuring optional numbers are null if undefined/empty
    const dataToSubmit: ProductData = {
        ...formData,
        purchase_price: formData.purchase_price === undefined ? null : formData.purchase_price,
        reorder_level: formData.reorder_level === undefined ? null : formData.reorder_level,
        // Ensure required number fields have valid defaults if somehow still undefined (shouldn't happen with validation)
        sale_price: formData.sale_price ?? 0,
        quantity_on_hand: formData.quantity_on_hand ?? 0,
    };


    try {
      let resultProduct: Product;
      if (isEditing && product?.id) {
        resultProduct = await updateProduct(product.id, dataToSubmit);
        toast.success(t('admin.forms.product.notifications.update_success', { name: resultProduct.name }));
      } else {
        resultProduct = await addProduct(dataToSubmit);
        toast.success(t('admin.forms.product.notifications.add_success', { name: resultProduct.name }));
      }
      onSuccess(resultProduct); // Pass the added/updated product back
    } catch (err) {
      const message = t(isEditing ? 'admin.forms.product.errors.update' : 'admin.forms.product.errors.add');
      setError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700">{t('admin.forms.product.labels.purchase_price')}</label>
          <input
            type="number"
            id="purchase_price"
            name="purchase_price"
            value={formData.purchase_price ?? ''} // Use empty string for undefined in input
            onChange={handleChange}
            step="0.01"
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700">{t('admin.forms.product.labels.sale_price')} <span className="text-red-500">*</span></label>
          <input
            type="number"
            id="sale_price"
            name="sale_price"
            value={formData.sale_price}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50"
        >
          {t('common.cancel')} {/* Use common cancel key */}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('common.saving') : (isEditing ? t('admin.forms.product.buttons.update') : t('admin.forms.product.buttons.add'))}
        </button>
      </div>
    </form>
  );
};

export default AddEditProductForm;
