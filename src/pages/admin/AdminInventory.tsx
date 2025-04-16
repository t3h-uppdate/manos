import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
// Import necessary functions for fetching/managing products from Supabase client
import { fetchProducts, deleteProduct, Product } from '../../lib/inventoryApi';
// Import AddEditProductForm modal component
import AddEditProductForm from '../../components/admin/AddEditProductForm';
// Import Modal component
import Modal from '../../components/Modal';
// Import toast for notifications
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Product interface is now imported from inventoryApi.ts

const AdminInventory: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term
  const [currentPage, setCurrentPage] = useState<number>(1); // State for pagination
  const [itemsPerPage] = useState<number>(10); // Items per page (can be made configurable)

  // Define loadProducts using useCallback
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      const message = t('admin.inventory.errors.load');
      setError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]); // Add t to dependency array

  useEffect(() => {
    loadProducts();
  }, [loadProducts]); // Include loadProducts in the dependency array

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteConfirm = () => {
    setProductToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteProduct = async () => {
    // Ensure productToDelete and its id exist
    if (!productToDelete || typeof productToDelete.id === 'undefined') {
        toast.error(t('admin.inventory.errors.invalid_id'));
        return;
    }

    const productId = productToDelete.id; // Store id before closing modal potentially clears state
    const productName = productToDelete.name; // Store name for toast message

    try {
      await deleteProduct(productId);
      // Update state optimistically or re-fetch
      setProducts(products.filter(p => p.id !== productId));
      toast.success(t('admin.inventory.notifications.delete_success', { name: productName }));
      closeDeleteConfirm();
    } catch (err) {
      const message = t('admin.inventory.errors.delete', { name: productName });
      // setError(message); // Optionally set error state for display elsewhere
      toast.error(message);
      console.error(err);
      closeDeleteConfirm(); // Close modal even on error
    }
  };

  const handleFormSuccess = (/* updatedProduct?: Product */) => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    // Re-fetch products after successful add/edit
    loadProducts(); // Now we can call loadProducts here
    console.log("Form success, reloading products...");
    // Add success toast for add/edit if AddEditProductForm doesn't handle it
    // toast.success(t(selectedProduct ? 'admin.inventory.notifications.update_success' : 'admin.inventory.notifications.add_success'));
  };

  if (loading) return <div className="p-6">{t('common.loading')}</div>; // Use common loading key
  if (error) return <div className="p-6 text-red-600">{error}</div>; // Error message is already translated

  // Filter products based on search term (client-side)
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-semibold text-gray-800">{t('admin.inventory.title')}</h1>
        <div className="flex items-center gap-4">
           {/* Search Input */}
           <input
            type="text"
            placeholder={t('admin.inventory.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <button
            onClick={handleAddProduct}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out whitespace-nowrap"
          >
            {t('admin.inventory.add_button')}
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal table-fixed"> {/* Added table-fixed for potentially better column control */}
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
              <th className="px-3 py-3 border-b-2 border-gray-200 w-16">{t('admin.inventory.table.image', 'Image')}</th> {/* New Image column header */}
              <th className="px-5 py-3 border-b-2 border-gray-200">{t('admin.inventory.table.name')}</th>
              <th className="px-5 py-3 border-b-2 border-gray-200">{t('admin.inventory.table.brand')}</th>
              <th className="px-5 py-3 border-b-2 border-gray-200">{t('admin.inventory.table.category')}</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-right">{t('admin.inventory.table.sale_price')}</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-right">{t('admin.inventory.table.quantity')}</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-right">{t('admin.inventory.table.reorder_level')}</th>
              <th className="px-5 py-3 border-b-2 border-gray-200">{t('common.actions')}</th> {/* Use common actions key */}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                {/* Adjusted colSpan for the new column */}
                <td colSpan={8} className="text-center py-10 text-gray-500">
                  {searchTerm ? t('admin.inventory.no_search_results') : t('admin.inventory.no_products')}
                </td>
              </tr>
            ) : (
              currentProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  {/* New Image column cell */}
                  <td className="px-3 py-2 border-b border-gray-200 text-sm">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name} // Use product name as alt text
                        className="h-10 w-10 object-cover rounded" // Basic styling for thumbnail
                        onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if image fails to load
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">{t('common.none', 'None')}</span> // Display 'None' if no image
                    )}
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{product.name}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{product.brand || t('common.not_applicable')}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{product.category || t('common.not_applicable')}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-right">${product.sale_price.toFixed(2)}</td> {/* Currency formatting might need localization later */}
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-right">{product.quantity_on_hand}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-right">{product.reorder_level || t('common.not_applicable')}</td> {/* Use common N/A key */}
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      {t('common.edit')} {/* Use common edit key */}
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(product)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('common.delete')} {/* Use common delete key */}
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

       {/* Add/Edit Modal */}
       <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t(selectedProduct ? 'admin.inventory.edit_modal_title' : 'admin.inventory.add_modal_title')}
       >
        <AddEditProductForm
          product={selectedProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

       {/* Delete Confirmation Modal */}
       <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteConfirm}
        title={t('admin.inventory.delete_modal_title')}
       >
        <div className="p-6">
          {/* Removed h3 as Modal now provides title */}
          <p className="text-sm text-gray-500 mb-6">
            {t('admin.inventory.confirm_delete', { name: productToDelete?.name || 'this product' })}
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeDeleteConfirm}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            >
              {t('common.delete')} {/* Use common delete key */}
            </button>
          </div>
        </div>
      </Modal>
       {/* Placeholder divs removed */}
    </div>
  );
};

export default AdminInventory;
