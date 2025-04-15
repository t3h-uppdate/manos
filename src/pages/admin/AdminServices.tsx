import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
// Import Service type and API functions from serviceApi.ts
import { fetchServices, deleteService, Service } from '../../lib/serviceApi';
// Import AddEditServiceForm modal component
import AddEditServiceForm from '../../components/admin/AddEditServiceForm';
import Modal from '../../components/Modal'; // Assuming Modal component exists

// Service interface defined in serviceApi.ts, no need to redefine here

const AdminServices: React.FC = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // Load services using actual API call
  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchServices(); // Use actual API call
      setServices(data);
    } catch (err) {
      const message = t('admin.services.errors.load', 'Failed to load services.'); // Added default value
      setError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleAddService = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteConfirm = () => {
    setServiceToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Handle deleting a service using actual API call
  const handleDeleteService = async () => {
    if (!serviceToDelete || typeof serviceToDelete.id === 'undefined') {
      // Added default value
      toast.error(t('admin.services.errors.invalid_id', 'Invalid service selected for deletion.'));
      return;
    }
    const serviceId = serviceToDelete.id;
    const serviceName = serviceToDelete.name;
    try {
      await deleteService(serviceId); // Use actual API call
      setServices(services.filter(s => s.id !== serviceId));
      // Added default value
      toast.success(t('admin.services.notifications.delete_success', `Service "${serviceName}" deleted successfully.`, { name: serviceName }));
      closeDeleteConfirm();
    } catch (err) {
      // Added default value
      const message = t('admin.services.errors.delete', `Failed to delete service "${serviceName}".`, { name: serviceName });
      toast.error(message);
      console.error(err);
      closeDeleteConfirm();
    }
  };

  // Handle successful form submission (add/edit)
  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    loadServices(); // Re-fetch after add/edit
    // Success toast is handled within AddEditServiceForm
  };

  if (loading) return <div className="p-6">{t('common.loading')}</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  // Filter services based on search term (client-side)
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        {/* TODO: Add translation key */}
        <h1 className="text-3xl font-semibold text-gray-800">{t('admin.services.title', 'Manage Services')}</h1>
        <div className="flex items-center gap-4">
           <input
            type="text"
            // TODO: Add translation key
            placeholder={t('admin.services.search_placeholder', 'Search services...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <button
            onClick={handleAddService}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out whitespace-nowrap"
          >
            {/* TODO: Add translation key */}
            {t('admin.services.add_button', 'Add Service')}
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
              {/* TODO: Add translation keys */}
              <th className="px-5 py-3 border-b-2 border-gray-200">{t('admin.services.table.name', 'Name')}</th>
              <th className="px-5 py-3 border-b-2 border-gray-200">{t('admin.services.table.category', 'Category')}</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-right">{t('admin.services.table.duration', 'Duration (min)')}</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-right">{t('admin.services.table.price', 'Price')}</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-center">{t('admin.services.table.active', 'Active')}</th>
              <th className="px-5 py-3 border-b-2 border-gray-200">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  {/* TODO: Add translation keys */}
                  {searchTerm ? t('admin.services.no_search_results', 'No services match your search.') : t('admin.services.no_services', 'No services found.')}
                </td>
              </tr>
            ) : (
              currentServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{service.name}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{service.category || t('common.not_applicable')}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-right">{service.duration_minutes}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-right">${service.price.toFixed(2)}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-center">
                    {service.is_active === undefined || service.is_active === null ? t('common.unknown') : (service.is_active ? t('common.yes') : t('common.no'))}
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <button
                      onClick={() => handleEditService(service)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(service)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

       {/* Pagination Controls */}
       {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.previous')}
          </button>
          <span className="text-gray-700">
            {t('common.pagination', { currentPage, totalPages })}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.next')}
          </button>
        </div>
      )}

       {/* Add/Edit Modal using AddEditServiceForm */}
       <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // TODO: Add translation keys
        title={t(selectedService ? 'admin.services.edit_modal_title' : 'admin.services.add_modal_title', selectedService ? 'Edit Service' : 'Add Service')}
       >
        <AddEditServiceForm
          service={selectedService}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

       {/* Delete Confirmation Modal */}
       <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteConfirm}
        // TODO: Add translation key
        title={t('admin.services.delete_modal_title', 'Confirm Deletion')}
       >
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-6">
            {/* TODO: Add translation key */}
            {t('admin.services.confirm_delete', `Are you sure you want to delete ${serviceToDelete?.name || 'this service'}? This action cannot be undone.`, { name: serviceToDelete?.name || 'this service' })}
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeDeleteConfirm}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleDeleteService}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            >
              {t('common.delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminServices;
