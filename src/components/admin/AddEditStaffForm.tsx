import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { Staff, StaffData, addStaff, updateStaff } from '../../lib/staffApi';

interface AddEditStaffFormProps {
  staff: Staff | null; // Staff member to edit, or null to add
  onSuccess: (staff: Staff) => void; // Callback on successful add/edit
  onCancel: () => void; // Callback on cancel
}

const AddEditStaffForm: React.FC<AddEditStaffFormProps> = ({ staff, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<StaffData>>({
    name: '',
    phone: '',
    is_active: true, // Default to active
    bio: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = staff !== null;

  useEffect(() => {
    if (isEditing && staff) {
      // Populate form if editing
      setFormData({
        name: staff.name,
        phone: staff.phone ?? '',
        is_active: staff.is_active ?? true,
        bio: staff.bio ?? '',
      });
    } else {
      // Reset form if adding
      setFormData({
        name: '',
        phone: '',
        is_active: true,
        bio: '',
      });
    }
  }, [staff, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Need to cast target to HTMLInputElement for 'checked' property
    const target = e.target as HTMLInputElement;
    const checked = target.checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    if (!formData.name) {
      setError(t('admin.forms.staff.errors.name_required', 'Staff name is required.')); // TODO: Add translation key
      setIsSubmitting(false);
      return;
    }

    // Prepare data for API
    const dataToSubmit: StaffData = {
      name: formData.name,
      phone: formData.phone || null,
      is_active: formData.is_active ?? true,
      bio: formData.bio || null,
    };

    try {
      let resultStaff: Staff;
      if (isEditing && staff?.id) {
        resultStaff = await updateStaff(staff.id, dataToSubmit);
        toast.success(t('admin.forms.staff.notifications.update_success', `Staff member "${resultStaff.name}" updated successfully.`, { name: resultStaff.name })); // TODO: Add translation key
      } else {
        resultStaff = await addStaff(dataToSubmit);
        toast.success(t('admin.forms.staff.notifications.add_success', `Staff member "${resultStaff.name}" added successfully.`, { name: resultStaff.name })); // TODO: Add translation key
      }
      onSuccess(resultStaff);
    } catch (err) {
      const message = t(isEditing ? 'admin.forms.staff.errors.update' : 'admin.forms.staff.errors.add', 'Failed to save staff member.'); // TODO: Add translation keys
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('admin.forms.staff.labels.name', 'Name')} <span className="text-red-500">*</span></label> {/* TODO: Add translation key */}
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
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('admin.forms.staff.labels.phone', 'Phone')}</label> {/* TODO: Add translation key */}
        <input
          type="tel" // Use 'tel' type for phone numbers
          id="phone"
          name="phone"
          value={formData.phone ?? ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">{t('admin.forms.staff.labels.bio', 'Bio')}</label> {/* TODO: Add translation key */}
        <textarea
          id="bio"
          name="bio"
          value={formData.bio ?? ''}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

       <div className="flex items-center">
          <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active ?? true}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">{t('admin.forms.staff.labels.active', 'Staff member is Active')}</label> {/* TODO: Add translation key */}
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
          {isSubmitting ? t('common.saving') : (isEditing ? t('admin.forms.staff.buttons.update', 'Update Staff') : t('admin.forms.staff.buttons.add', 'Add Staff'))}
        </button>
      </div>
    </form>
  );
};

export default AddEditStaffForm;
