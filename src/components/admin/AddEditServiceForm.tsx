import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
// Import Service type, ServiceData type, addService, updateService from serviceApi.ts
import { Service, ServiceData, addService, updateService } from '../../lib/serviceApi';

// Service and ServiceData types are now imported from serviceApi.ts

interface AddEditServiceFormProps {
  service: Service | null; // Service to edit, or null to add
  onSuccess: (service: Service) => void; // Callback on successful add/edit
  onCancel: () => void; // Callback on cancel
}

const AddEditServiceForm: React.FC<AddEditServiceFormProps> = ({ service, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<ServiceData>>({ // Use Partial for initial state
    name: '',
    description: '',
    duration_minutes: undefined, // Use undefined for numbers initially
    price: undefined,
    is_active: true, // Default to active
    category: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = service !== null;

  useEffect(() => {
    if (isEditing && service) {
      // Populate form if editing
      setFormData({
        name: service.name,
        description: service.description ?? '',
        duration_minutes: service.duration_minutes,
        price: service.price,
        is_active: service.is_active ?? true,
        category: service.category ?? '',
      });
    } else {
      // Reset form if adding
      setFormData({
        name: '',
        description: '',
        duration_minutes: undefined,
        price: undefined,
        is_active: true,
        category: '',
      });
    }
  }, [service, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement; // Assert type for checked property

    let processedValue: string | number | boolean | undefined = value;

    if (type === 'number') {
      processedValue = value === '' ? undefined : parseFloat(value);
      if (isNaN(processedValue as number)) {
        processedValue = undefined;
      }
    } else if (type === 'checkbox') {
      processedValue = checked;
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
    if (!formData.name || formData.duration_minutes === undefined || formData.duration_minutes <= 0 || formData.price === undefined || formData.price < 0) {
      // TODO: Add translation key
      setError(t('admin.forms.service.errors.required_fields', 'Please fill in all required fields (Name, Duration, Price) with valid values.'));
      setIsSubmitting(false);
      return;
    }

    // Prepare data for API
    const dataToSubmit: ServiceData = {
      name: formData.name,
      description: formData.description || null, // Ensure null if empty
      duration_minutes: formData.duration_minutes, // Already validated > 0
      price: formData.price, // Already validated >= 0
      is_active: formData.is_active ?? true, // Default to true if undefined
      category: formData.category || null, // Ensure null if empty
    };

    try {
      let resultService: Service;
      if (isEditing && service?.id) {
        resultService = await updateService(service.id, dataToSubmit); // Use actual API call
         // TODO: Add translation key
         toast.success(t('admin.forms.service.notifications.update_success', `Service "${resultService.name}" updated successfully.`, { name: resultService.name }));
       } else {
         resultService = await addService(dataToSubmit); // Use actual API call
         // TODO: Add translation key
         toast.success(t('admin.forms.service.notifications.add_success', `Service "${resultService.name}" added successfully.`, { name: resultService.name }));
       }
       onSuccess(resultService);
     } catch (err) {
      // TODO: Add translation keys
      const message = t(isEditing ? 'admin.forms.service.errors.update' : 'admin.forms.service.errors.add', 'Failed to save service.');
      setError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && <div className="text-red-600 bg-red-100 p-3 rounded">{error}</div>}

      {/* Form Fields */}
      <div>
        {/* TODO: Add translation key */}
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('admin.forms.service.labels.name', 'Service Name')} <span className="text-red-500">*</span></label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name ?? ''}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        {/* TODO: Add translation key */}
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('admin.forms.service.labels.description', 'Description')}</label>
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
          {/* TODO: Add translation key */}
          <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700">{t('admin.forms.service.labels.duration', 'Duration (minutes)')} <span className="text-red-500">*</span></label>
          <input
            type="number"
            id="duration_minutes"
            name="duration_minutes"
            value={formData.duration_minutes ?? ''}
            onChange={handleChange}
            required
            min="1" // Duration must be positive
            step="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          {/* TODO: Add translation key */}
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">{t('admin.forms.service.labels.price', 'Price')} <span className="text-red-500">*</span></label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price ?? ''}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div>
          {/* TODO: Add translation key */}
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">{t('admin.forms.service.labels.category', 'Category')}</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category ?? ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
         <div className="flex items-center pt-6">
            <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active ?? true}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            {/* TODO: Add translation key */}
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">{t('admin.forms.service.labels.active', 'Service is Active')}</label>
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
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* TODO: Add translation keys */}
          {isSubmitting ? t('common.saving') : (isEditing ? t('admin.forms.service.buttons.update', 'Update Service') : t('admin.forms.service.buttons.add', 'Add Service'))}
        </button>
      </div>
    </form>
  );
};

export default AddEditServiceForm;
