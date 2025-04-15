import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '../../lib/supabaseClient';
import { EventInput, BusinessHoursInput } from '@fullcalendar/core';

// Re-use the OperatingHours structure (or import if moved to a shared types file)
interface DayHours {
  open: boolean;
  start: string;
  end: string;
}
interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

// Removed unused Booking interface definition

const AdminCalendar: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const [events, setEvents] = useState<EventInput[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHoursInput | null>(null);
  const [slotMinTime, setSlotMinTime] = useState('08:00'); // Default start time
  const [slotMaxTime, setSlotMaxTime] = useState('20:00'); // Default end time
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // dayMap moved inside useEffect

  useEffect(() => {
    // Map day names to FullCalendar's day numbers (moved inside)
    const dayMap: { [key in keyof OperatingHours]: number } = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    // Define interface for the fetched booking data shape
    interface FetchedBookingData {
      id: string;
      start_time: string;
      end_time: string;
      // Adjust interface to expect arrays for joined data, or null
      customers: { name: string }[] | null;
      services: { name: string }[] | null;
      staff: { name: string }[] | null;
    }

    // Helper to format OperatingHours into FullCalendar's BusinessHoursInput (moved inside)
    const formatBusinessHours = (hours: OperatingHours): BusinessHoursInput => {
      const formatted: BusinessHoursInput = [];
      for (const dayName in hours) {
        const dayKey = dayName as keyof OperatingHours;
        if (hours[dayKey].open) {
          formatted.push({
            daysOfWeek: [dayMap[dayKey]],
            startTime: hours[dayKey].start,
            endTime: hours[dayKey].end,
          });
        }
      }
      // FullCalendar can often merge contiguous blocks automatically,
      // but this format (one entry per open day) is clear and reliable.
      return formatted;
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null); // Reset error at the start of fetch
      try {
        // Fetch bookings and settings concurrently
        const [bookingsResponse, settingsResponse] = await Promise.all([
          supabase
            .from('bookings')
            .select(`
              id,
              start_time,
              end_time,
              customers ( name ),
              services ( name ),
              staff ( name )
            `),
          supabase
            .from('settings')
            .select('key, value')
            .eq('key', 'salon_hours')
            .maybeSingle() // Expect 0 or 1 row
        ]);

        // Process Bookings
        if (bookingsResponse.error) throw bookingsResponse.error;
        const formattedEvents: EventInput[] = (bookingsResponse.data || []).map((booking: FetchedBookingData) => { // Apply updated interface here
          // Access the first element of the array if it exists
          const customerName = booking.customers?.[0]?.name;
          const serviceName = booking.services?.[0]?.name;
          const staffName = booking.staff?.[0]?.name;
          const titleService = serviceName || t('admin.calendar.event.default_service');
          const titleCustomer = customerName || t('admin.calendar.event.default_customer');
          const titleStaff = staffName || t('admin.calendar.event.default_staff');
          return {
            id: booking.id,
            title: `${titleService} - ${titleCustomer} (${titleStaff})`,
            start: booking.start_time,
            end: booking.end_time,
          };
        });
        setEvents(formattedEvents);

        // Process Settings (Operating Hours)
        if (settingsResponse.error) throw settingsResponse.error;
        if (settingsResponse.data?.value) {
          try {
            const parsedHours: OperatingHours = JSON.parse(settingsResponse.data.value);
            setBusinessHours(formatBusinessHours(parsedHours));

            // Calculate min/max times for slot display
            let minTime = '24:00';
            let maxTime = '00:00';
            let hasOpenHours = false;
            for (const dayKey in parsedHours) {
              const day = parsedHours[dayKey as keyof OperatingHours];
              if (day.open) {
                hasOpenHours = true;
                if (day.start < minTime) minTime = day.start;
                // For maxTime, consider the end time. If end is '00:00', treat it as 24:00 for comparison.
                const effectiveEndTime = day.end === '00:00' ? '24:00' : day.end;
                if (effectiveEndTime > maxTime) maxTime = effectiveEndTime;
              }
            }

            if (hasOpenHours) {
              // Optional: Add buffer (e.g., 1 hour) if desired, ensure format HH:mm
              // Example: Pad start time back by an hour (handle 00:00 case)
              // const startHour = parseInt(minTime.split(':')[0]);
              // const paddedStartHour = Math.max(0, startHour - 1);
              // setSlotMinTime(`${String(paddedStartHour).padStart(2, '0')}:00`);

              // Example: Pad end time forward by an hour (handle 24:00 case)
              // const endHour = parseInt(maxTime.split(':')[0]);
              // const paddedEndHour = Math.min(24, endHour + (maxTime.split(':')[1] === '00' ? 0 : 1)); // Add hour only if end time is not exactly on the hour
              // setSlotMaxTime(`${String(paddedEndHour).padStart(2, '0')}:00`);

              // Using exact min/max for now:
              setSlotMinTime(minTime);
              setSlotMaxTime(maxTime === '24:00' ? '24:00:00' : maxTime); // FC needs seconds for 24:00
            } else {
              // No open hours found, use defaults
              setSlotMinTime('08:00');
              setSlotMaxTime('20:00');
            }

          } catch (parseError) {
            console.error("Error parsing salon_hours JSON:", parseError);
            // Optionally, show a toast notification for parse error
            // toast.error(t('admin.calendar.errors.parse_hours'));
            setBusinessHours(null);
            setSlotMinTime('08:00'); // Use defaults on parse error
            setSlotMaxTime('20:00');
          }
        } else {
          console.warn("salon_hours setting not found.");
          // Optionally, show a toast notification if settings are missing
          // toast.warn(t('admin.calendar.warnings.settings_missing'));
          setBusinessHours(null);
          setSlotMinTime('08:00'); // Use defaults if setting not found
          setSlotMaxTime('20:00');
        }

      } catch (err: unknown) { // Use unknown for catch block
        console.error("Error fetching calendar data:", err);
        // Type guard for error message
        let errorMessage = t('admin.calendar.errors.fetch');
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        }
        setError(errorMessage);
        setEvents([]); // Clear events on error
        setBusinessHours(null); // Clear business hours on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]); // Removed dayMap from dependency array

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">{t('admin.calendar.title')}</h1>

      {loading && <p>{t('common.loading')}</p>} {/* Use common loading key */}
      {error && <p className="text-red-600 bg-red-100 p-3 rounded mb-4">{error}</p>} {/* Error message is already translated */}

      {!loading && !error && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            editable={false}
            selectable={false}
            businessHours={businessHours ?? undefined}
            slotMinTime={slotMinTime} // Add calculated min time
            slotMaxTime={slotMaxTime} // Add calculated max time
            height="auto"
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;
