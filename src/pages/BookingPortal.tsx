import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchStaffAvailability, AvailableSlot } from '../lib/availabilityApi';
import { createBooking, NewBookingData } from '../lib/bookingApi';
import { fetchServices, Service } from '../lib/serviceApi';
import { fetchActiveStaff, Staff, fetchStaffByService } from '../lib/staffApi'; // Import staff API
import { findOrCreateCustomer } from '../lib/customerApi';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';

const BookingPortal: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<number>(0); // Step 0: Select Service
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]); // State for staff members
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null); // State for selected staff
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [clientPhone, setClientPhone] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Fetch services on component mount
  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const data = await fetchServices();
        setServices(data);
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setError(t('booking.errorLoadServices'));
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, [t]);

  // Fetch availability when date, service, or staff changes
  useEffect(() => {
    if (selectedDate && selectedService) {
      const loadAvailability = async () => {
        setLoading(true);
        setError(null);
        setSelectedSlot(null);
        setAvailableSlots([]);
        try {
          const slots = await fetchStaffAvailability(
            selectedService.duration_minutes,
            selectedDate
          );
          setAvailableSlots(slots);
        } catch (err) {
          console.error('Failed to load availability:', err);
          setError(t('booking.errorLoadAvailability'));
        } finally {
          setLoading(false);
        }
      };
      loadAvailability();
    }
  }, [selectedDate, selectedService, selectedStaff, t]);

  const handleSelectService = async (service: Service) => {
    setSelectedService(service);
    // Reset staff selection when service changes
    setSelectedStaff(null);
    try {
      // Fetch staff members who can provide this service
      const availableStaff = await fetchStaffByService(service.id);
      setStaff(availableStaff);
    } catch (err) {
      console.error('Failed to fetch staff for service:', err);
      setError(t('booking.errorLoadStaff'));
    }
    setStep(1); // Move to Step 1 (Select Time)
  };

  const handleSelectSlot = (slot: AvailableSlot) => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setSelectedSlot(slot);
      setStep(2); // Move to Step 2 (Enter Details)
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.email) {
      setError(t('booking.errorAuthRequired'));
      navigate('/login?redirect=/book');
      return;
    }

    if (!selectedSlot || !selectedSlot.datetime || !selectedService) {
      setError(t('booking.errorSelectSlot'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const customerName = user.user_metadata?.full_name || user.email.split('@')[0];
      const customerId = await findOrCreateCustomer({
        authUserId: user.id,
        name: customerName,
        email: user.email,
        phone: clientPhone || null,
      });

      const startTime = new Date(selectedSlot.datetime);
      const endTime = new Date(startTime.getTime() + selectedService.duration_minutes * 60000);

      const bookingData: NewBookingData = {
        service_id: selectedService.id,
        staff_id: selectedStaff ? selectedStaff.id : null, // Include selected staff ID
        customer_id: customerId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        message: clientMessage.trim(),
      };

      await createBooking(bookingData);
      setStep(3); // Move to Step 3 (Confirmation)
    } catch (err) {
      console.error('Failed to create booking:', err);
      setError(t('booking.errorCreateBooking'));
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    if (authLoading) {
      return <div className="text-center p-10">{t('booking.authenticating')}</div>;
    }

    if (loading && step !== 0) return <div className="text-center p-10">{t('common.loading')}</div>;
    if (error) return <div className="text-center p-10 text-red-600">{error}</div>;

    switch (step) {
      case 0: // Step 0: Select Service
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">{t('booking.selectServiceTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 border rounded shadow hover:shadow-lg cursor-pointer"
                  onClick={() => handleSelectService(service)}
                >
                  <h3 className="text-lg font-bold">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  <p className="text-sm text-gray-800">
                    {t('booking.duration')}: {service.duration_minutes} {t('booking.minutes')}
                  </p>
                  <p className="text-sm text-gray-800">
                    {t('booking.price')}: ${service.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case 1: // Step 1: Select Time Slot and Staff
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">{t('booking.selectDateTimeTitle')}</h2>
            <button onClick={() => setStep(0)} className="mb-4 text-[#D4AF37] hover:underline">
              {t('booking.backToServiceSelection')}
            </button>
            <div className="mb-6">
              <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-1">
                {t('booking.selectDateLabel')}
              </label>
              <DatePicker
                id="bookingDate"
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                minDate={new Date()}
                inline
              />
            </div>
            <div className="mb-6">
              <label htmlFor="staffSelect" className="block text-sm font-medium text-gray-700 mb-1">
                {t('booking.selectStaffLabel')}
              </label>
              <select
                id="staffSelect"
                value={selectedStaff?.id || ''}
                onChange={(e) =>
                  setSelectedStaff(staff.find((s) => s.id === Number(e.target.value)) || null)
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              >
                <option value="">{t('booking.anyStaff')}</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <h3 className="text-xl font-semibold mb-3">
              {t('booking.availableSlotsTitle', {
                date: selectedDate ? selectedDate.toLocaleDateString() : t('booking.selectedDateFallback'),
              })}
            </h3>
            {loading ? (
              <p>{t('booking.loadingSlots')}</p>
            ) : availableSlots.length === 0 ? (
              <p>{t('booking.noSlots')}</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.datetime}
                    onClick={() => handleSelectSlot(slot)}
                    className="p-2 border rounded bg-gray-100 hover:bg-[#D4AF37]/20 text-center text-sm"
                  >
                    {new Date(slot.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      case 2: // Step 2: Enter Details
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">{t('booking.enterDetailsTitle')}</h2>
            <button 
              onClick={() => setStep(1)} 
              className="mb-6 text-[#D4AF37] hover:underline flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('booking.backToTimeSelection')}
            </button>

            {/* Booking Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-medium mb-3">{t('booking.bookingSummary')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('booking.service')}:</span>
                  <span className="font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('booking.dateTime')}:</span>
                  <span className="font-medium">
                    {selectedSlot ? new Date(selectedSlot.datetime).toLocaleString([], {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    }) : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('booking.duration')}:</span>
                  <span className="font-medium">{selectedService?.duration_minutes} {t('booking.minutes')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('booking.price')}:</span>
                  <span className="font-medium">${selectedService?.price.toFixed(2)}</span>
                </div>
                {selectedStaff && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('booking.staff')}:</span>
                    <span className="font-medium">{selectedStaff.name}</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-4">{t('booking.contactInformation')}</h3>
                
                <div className="space-y-4">
                  {/* Client Email (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('booking.emailLabel')}
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500"
                    />
                  </div>

                  {/* Phone Number Field */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      {t('booking.phoneLabel')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={clientPhone || user?.user_metadata?.phone || ''}
                      onChange={(e) => setClientPhone(e.target.value)}
                      required
                      placeholder={t('booking.phonePlaceholder')}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#D4AF37] focus:ring focus:ring-[#D4AF37] focus:ring-opacity-50"
                    />
                    {!clientPhone && (
                      <p className="mt-1 text-sm text-red-600">{t('booking.phoneError')}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-4">{t('booking.additionalInformation')}</h3>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    {t('booking.messageLabel')} <span className="text-gray-500">({t('booking.optional')})</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    maxLength={250}
                    placeholder={t('booking.messagePlaceholder')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#D4AF37] focus:ring focus:ring-[#D4AF37] focus:ring-opacity-50"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {t('booking.characterLimit', { count: 250 - clientMessage.length })}
                  </p>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">
                  <p>{t('booking.termsNotice')}</p>
                  <p className="mt-2">{t('booking.cancellationPolicy')}</p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !clientPhone}
                className="w-full bg-[#D4AF37] hover:bg-[#B4941F] text-white font-bold py-3 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('booking.bookingButtonLoading')}
                  </span>
                ) : (
                  t('booking.confirmButton')
                )}
              </button>
            </form>
          </div>
        );
      case 3: // Step 3: Confirmation
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <div className="mb-8">
                <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <circle className="opacity-25" cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M14 24l8 8 16-16"/>
                </svg>
                <h2 className="mt-4 text-3xl font-semibold text-green-600">{t('booking.confirmationTitle')}</h2>
                <p className="mt-2 text-lg text-gray-600">
                  {t('booking.confirmationGreeting', { name: user?.user_metadata?.full_name || user?.email || '' })}
                </p>
              </div>

              {/* Booking Details Card */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
                <h3 className="text-xl font-medium mb-4">{t('booking.bookingDetails')}</h3>
                <div className="space-y-3 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">{t('booking.service')}</p>
                      <p className="font-medium">{selectedService?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('booking.price')}</p>
                      <p className="font-medium">${selectedService?.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('booking.dateTime')}</p>
                      <p className="font-medium">
                        {selectedSlot ? new Date(selectedSlot.datetime).toLocaleString([], {
                          dateStyle: 'full',
                          timeStyle: 'short'
                        }) : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('booking.duration')}</p>
                      <p className="font-medium">{selectedService?.duration_minutes} {t('booking.minutes')}</p>
                    </div>
                    {selectedStaff && (
                      <div>
                        <p className="text-sm text-gray-600">{t('booking.staff')}</p>
                        <p className="font-medium">{selectedStaff.name}</p>
                      </div>
                    )}
                  </div>

                  {clientMessage && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">{t('booking.yourMessage')}</p>
                      <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm italic">"{clientMessage}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/my-bookings"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#D4AF37] hover:bg-[#B4941F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37]"
                >
                  {t('booking.viewMyBookings')}
                </Link>
                <button
                  onClick={() => {
                    setStep(0);
                    setSelectedService(null);
                    setSelectedSlot(null);
                    setClientPhone('');
                    setClientMessage('');
                    setSelectedDate(new Date());
                  }}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37]"
                >
                  {t('booking.bookAnotherButton')}
                </button>
              </div>

              {/* Contact Support */}
              <p className="mt-8 text-sm text-gray-600">
                {t('booking.needHelp')}{' '}
                <Link to="/contact" className="text-[#D4AF37] hover:underline">
                  {t('booking.contactSupport')}
                </Link>
              </p>
            </div>
          </div>
        );
      default:
        return <div>{t('booking.invalidStep')}</div>;
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif text-center mb-12">{t('booking.pageTitle')}</h1>
        {renderStepContent()}
      </div>
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={t('booking.authModal.title')}
      >
        <div className="text-center">
          <p className="mb-4">{t('booking.authModal.message')}</p>
          <div className="flex justify-center space-x-4">
            <Link
              to={`/login?redirect=${location.pathname}${location.search}`}
              className="px-4 py-2 bg-[#D4AF37] text-white rounded hover:bg-[#B4941F]"
              onClick={() => setShowAuthModal(false)}
            >
              {t('navigation.login')}
            </Link>
            <Link
              to={`/register?redirect=${location.pathname}${location.search}`}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              onClick={() => setShowAuthModal(false)}
            >
              {t('navigation.register')}
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { BookingPortal };
