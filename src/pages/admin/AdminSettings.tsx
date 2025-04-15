import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-hot-toast'; // Import toast for notifications

interface Settings {
  salon_name: string;
  salon_phone: string;
  salon_address: string;
  salon_hours: string; // Will store JSON string
  // Add other settings keys as needed
}

// Structure for individual day's hours
interface DayHours {
  open: boolean;
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

// Structure for the entire week's operating hours
interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

const defaultDayHours: DayHours = { open: false, start: '09:00', end: '17:00' };
const defaultOperatingHours: OperatingHours = {
  monday: { ...defaultDayHours, open: true },
  tuesday: { ...defaultDayHours, open: true },
  wednesday: { ...defaultDayHours, open: true },
  thursday: { ...defaultDayHours, open: true },
  friday: { ...defaultDayHours, open: true },
  saturday: { ...defaultDayHours, open: true, start: '10:00', end: '16:00' },
  sunday: { ...defaultDayHours },
};

const AdminSettings: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const [settings, setSettings] = useState<Partial<Settings>>({});
  const [operatingHours, setOperatingHours] = useState<OperatingHours>(defaultOperatingHours);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch existing settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all rows from the settings table
      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('key, value');

      if (fetchError) throw fetchError;

      // Transform the key-value pairs into a Settings object
      const loadedSettings: Partial<Settings> = {};
      (data || []).forEach(item => {
        if (item.key && item.value !== null) {
          // Type assertion needed if Settings keys are strictly defined
          (loadedSettings as any)[item.key] = item.value;
        }
      });
      setSettings(loadedSettings);

      // Parse salon_hours JSON or use default
      try {
        const hoursString = loadedSettings.salon_hours;
        if (hoursString) {
          const parsedHours = JSON.parse(hoursString);
          // Basic validation could be added here
          setOperatingHours(parsedHours);
        } else {
          setOperatingHours(defaultOperatingHours);
        }
      } catch (parseError) {
        console.error("Error parsing salon_hours JSON:", parseError);
        const parseErrorMessage = t('admin.settings.errors.parse_hours');
        setError(parseErrorMessage);
        toast.error(parseErrorMessage); // Show toast as well
        setOperatingHours(defaultOperatingHours); // Fallback to default on parse error
      }

    } catch (err: any) {
      console.error("Error fetching settings:", err);
      const fetchErrorMessage = err.message || t('admin.settings.errors.load');
      setError(fetchErrorMessage);
      toast.error(fetchErrorMessage); // Show toast as well
    } finally {
      setLoading(false);
    }
  }, [t]); // Add t to dependency array

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]); // Keep fetchSettings dependency here

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    setSuccessMessage(null); // Clear success message on change
  };

  // Handle changes specifically for operating hours inputs
  const handleHoursChange = (
    day: keyof OperatingHours,
    field: keyof DayHours,
    value: string | boolean
  ) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
    setSuccessMessage(null); // Clear success message on change
  };


  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    // Create a copy of settings to modify
    const settingsToSave = { ...settings };

    // Stringify operating hours and add to the settings object
    try {
      settingsToSave.salon_hours = JSON.stringify(operatingHours);
    } catch (stringifyError) {
      console.error("Error stringifying operating hours:", stringifyError);
      setError(t('admin.settings.errors.stringify_hours'));
      toast.error(t('admin.settings.errors.stringify_hours'));
      setSaving(false);
      return;
    }

    // Prepare data for upsert (update or insert)
    const upsertData = Object.entries(settingsToSave)
        .filter(([, value]) => value !== undefined && value !== null) // Filter out potential undefined/null values
        .map(([key, value]) => ({ key, value: String(value) })); // Ensure value is string

    if (upsertData.length === 0) {
        setSaving(false);
        return; // Nothing to save
    }

    try {
      // Upsert all settings in one go
      const { error: upsertError } = await supabase
        .from('settings')
        .upsert(upsertData, { onConflict: 'key' }); // Specify the conflict column

      if (upsertError) throw upsertError;

      setSuccessMessage(t('admin.settings.notifications.update_success'));
      toast.success(t('admin.settings.notifications.update_success'));
      // Optionally re-fetch settings, though local state should be up-to-date
      // fetchSettings();

    } catch (err: any) {
      console.error("Error saving settings:", err);
      const saveErrorMessage = err.message || t('admin.settings.errors.save');
      setError(saveErrorMessage);
      toast.error(saveErrorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>{t('common.loading')}</p>; // Use common loading key
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">{t('admin.settings.title')}</h1>

      {error && <p className="text-red-600 bg-red-100 p-3 rounded mb-4">{error}</p>} {/* Error message is already translated */}
      {successMessage && <p className="text-green-600 bg-green-100 p-3 rounded mb-4">{successMessage}</p>} {/* Success message is already translated */}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        {/* Salon Name */}
        <div>
          <label htmlFor="salon_name" className="block text-sm font-medium text-gray-700">{t('admin.settings.labels.salon_name')}</label>
          <input
            type="text"
            id="salon_name"
            name="salon_name"
            value={settings.salon_name || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={saving}
          />
        </div>

        {/* Salon Phone */}
        <div>
          <label htmlFor="salon_phone" className="block text-sm font-medium text-gray-700">{t('admin.settings.labels.phone')}</label>
          <input
            type="tel"
            id="salon_phone"
            name="salon_phone"
            value={settings.salon_phone || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={saving}
          />
        </div>

        {/* Salon Address */}
        <div>
          <label htmlFor="salon_address" className="block text-sm font-medium text-gray-700">{t('admin.settings.labels.address')}</label>
          <textarea
            id="salon_address"
            name="salon_address"
            rows={3}
            value={settings.salon_address || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={saving}
          />
        </div>

        {/* Operating Hours Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{t('admin.settings.operating_hours.title')}</h3>
          <div className="space-y-4">
            {(Object.keys(operatingHours) as Array<keyof OperatingHours>).map((day) => (
              <div key={day} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center border-b border-gray-100 pb-4 last:border-b-0">
                {/* Day Name & Open Checkbox */}
                <div className="sm:col-span-1 flex items-center space-x-3">
                   <input
                    type="checkbox"
                    id={`${day}-open`}
                    checked={operatingHours[day].open}
                    onChange={(e) => handleHoursChange(day, 'open', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    disabled={saving}
                  />
                  <label htmlFor={`${day}-open`} className="capitalize font-medium text-gray-700">
                    {t(`common.days.${day}`)} {/* Translate day name */}
                  </label>
                </div>

                {/* Start Time */}
                <div className="sm:col-span-1">
                  <label htmlFor={`${day}-start`} className="block text-xs font-medium text-gray-500 mb-1">{t('admin.settings.operating_hours.start_time')}</label>
                  <input
                    type="time"
                    id={`${day}-start`}
                    value={operatingHours[day].start}
                    onChange={(e) => handleHoursChange(day, 'start', e.target.value)}
                    className="mt-1 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!operatingHours[day].open || saving}
                  />
                </div>

                {/* End Time */}
                <div className="sm:col-span-1">
                  <label htmlFor={`${day}-end`} className="block text-xs font-medium text-gray-500 mb-1">{t('admin.settings.operating_hours.end_time')}</label>
                  <input
                    type="time"
                    id={`${day}-end`}
                    value={operatingHours[day].end}
                    onChange={(e) => handleHoursChange(day, 'end', e.target.value)}
                    className="mt-1 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!operatingHours[day].open || saving}
                  />
                </div>
                 {/* Spacer for alignment */}
                 <div className="sm:col-span-1"></div>
              </div>
            ))}
          </div>
        </div>


        {/* Add fields for admin credential changes later if needed */}
        {/* Requires careful handling with Supabase Auth */}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? t('common.saving') : t('common.save_settings')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
