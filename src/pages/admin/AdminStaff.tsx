import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
 import { fetchStaff, deleteStaff, Staff } from '../../lib/staffApi';
 // TODO: Import AddEditStaffForm modal component
 import AddEditStaffForm from '../../components/admin/AddEditStaffForm';
 import Modal from '../../components/Modal'; // Assuming Modal component exists

 const AdminStaff: React.FC = () => {
  const { t } = useTranslation();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // Load staff using actual API call
  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStaff();
      setStaffList(data);
    } catch (err) {
      const message = t('admin.staff.errors.load', 'Failed to load staff members.'); // TODO: Add translation key
      setError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleAddStaff = () => {
    setSelectedStaff(null);
    setIsModalOpen(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (staff: Staff) => {
    setStaffToDelete(staff);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteConfirm = () => {
    setStaffToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Handle deleting a staff member using actual API call
  const handleDeleteStaff = async () => {
    if (!staffToDelete || typeof staffToDelete.id === 'undefined') {
      toast.error(t('admin.staff.errors.invalid_id', 'Invalid staff member selected for deletion.')); // TODO: Add translation key
      return;
    }
    const staffId = staffToDelete.id;
    const staffName = staffToDelete.name;
    try {
      await deleteStaff(staffId);
      setStaffList(staffList.filter(s => s.id !== staffId));
      toast.success(t('admin.staff.notifications.delete_success', `Staff member "${staffName}" deleted successfully.`, { name: staffName })); // TODO: Add translation key
      closeDeleteConfirm();
    } catch (err) {
      // Consider specific error for foreign key constraints if delete fails
      const message = t('admin.staff.errors.delete', `Failed to delete staff member "${staffName}". They might be assigned to bookings.`, { name: staffName }); // TODO: Add translation key
      toast.error(message);
      console.error(err);
      closeDeleteConfirm();
    }
  };

  // Handle successful form submission (add/edit)
  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
    loadStaff(); // Re-fetch after add/edit
    // Success toast likely handled within the form component
  };

  if (loading) return <div className="p-6">{t('common.loading')}</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  // Filter staff based on search term (client-side)
  const filteredStaff = staffList.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staff.phone && staff.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (staff.bio && staff.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-semibold text-gray-800">{t('admin.staff.title', 'Manage Staff')}</h1> {/* TODO: Add translation key */}
        <div className="flex items-center gap-4">
           <input
            type="text"
            placeholder={t('admin.staff.search_placeholder', 'Search staff...')} // TODO: Add translation key
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <button
            onClick={handleAddStaff}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out whitespace-nowrap"
          >
            {t('admin.staff.add_button', 'Add Staff Member')} {/* TODO: Add translation key */}
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
              {/* TODO: Add translation keys */}
              <th className="px-5 py-3 border-b-2 border-gray-200">{t('admin.staff.table.name', 'Name')}</th>
              <th className="px-5 py-3 border-b-2 border-gray-200">{t('admin.staff.table.phone', 'Phone')}</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-center">{t('admin.staff.table.active', 'Active')}</th>
              <th className="px-5 py-3 border-b-2 border-gray-200">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500">
                  {/* TODO: Add translation keys */}
                  {searchTerm ? t('admin.staff.no_search_results', 'No staff members match your search.') : t('admin.staff.no_staff', 'No staff members found.')}
                </td>
              </tr>
            ) : (
              currentStaff.map((staffMember) => (
                <tr key={staffMember.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{staffMember.name}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{staffMember.phone || t('common.not_applicable')}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-center">
                    {staffMember.is_active ? t('common.yes') : t('common.no')}
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <button
                      onClick={() => handleEditStaff(staffMember)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(staffMember)}
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

       {/* Add/Edit Modal Placeholder - Will use AddEditStaffForm */}
       <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
         title={t(selectedStaff ? 'admin.staff.edit_modal_title' : 'admin.staff.add_modal_title', selectedStaff ? 'Edit Staff Member' : 'Add Staff Member')} // TODO: Add translation keys
        >
         <AddEditStaffForm
           staff={selectedStaff}
           onSuccess={handleFormSuccess}
           onCancel={() => setIsModalOpen(false)}
         />
         {/* <div className="p-6">Staff Form Placeholder</div> */} {/* Placeholder Removed */}
       </Modal>

        {/* Delete Confirmation Modal */}
       <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteConfirm}
        title={t('admin.staff.delete_modal_title', 'Confirm Deletion')} // TODO: Add translation key
       >
         <div className="p-6">
           <p className="text-sm text-gray-500 mb-6">
             {/* TODO: Add translation key */}
             {t('admin.staff.confirm_delete', `Are you sure you want to delete ${staffToDelete?.name || 'this staff member'}? This action cannot be undone.`, { name: staffToDelete?.name || 'this staff member' })}
           </p>
           <div className="flex justify-end space-x-3">
             <button
              onClick={closeDeleteConfirm}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleDeleteStaff}
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

export default AdminStaff;
