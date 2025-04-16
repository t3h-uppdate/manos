import React, { useState, useEffect, useMemo } from 'react';
// Link and generateSlug are no longer needed here
import { useTranslation } from 'react-i18next';
import { fetchProducts, Product } from '../lib/inventoryApi'; // Removed generateSlug import
import LoadingSpinner from '../components/LoadingSpinner';
// Removed Footer import
// Removed Navbar import
import ProductCard from '../components/ProductCard';
import Modal from '../components/Modal'; // Import Modal component

// Define SortOption type based on example
type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const Inventory: React.FC = () => {
  const { t } = useTranslation();
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Store all fetched products
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<SortOption>('default');
  const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(false); // State for Quick View modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null); // State for product in modal

  // --- Modal Handlers ---
  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null); // Clear product when closing
  };

  // --- Fetch products on mount ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProducts();
        setAllProducts(data); // Store fetched data
      } catch (err) {
        console.error('Error fetching public inventory:', err);
        // Use translation key directly (will be defined in translations.ts)
        setError(t('inventory.errors.load'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [t]); // Keep t dependency for error message translation

  // --- Filtering ---
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>(['all']); // Start with 'all'
    allProducts.forEach(p => {
      if (p.category) {
        uniqueCategories.add(p.category);
      }
    });
    return Array.from(uniqueCategories).sort((a, b) => a === 'all' ? -1 : b === 'all' ? 1 : a.localeCompare(b)); // Keep 'all' first
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return allProducts;
    }
    return allProducts.filter(p => p.category === selectedCategory);
  }, [allProducts, selectedCategory]);

  // --- Sorting ---
  const sortedProducts = useMemo(() => {
    let sorted: Product[] = [...filteredProducts]; // Create a typed copy to sort
    switch (sortOrder) {
      case 'price-asc':
        // Ensure sale_price is treated as a number, default to Infinity if null/undefined
        sorted.sort((a, b) => (a.sale_price ?? Infinity) - (b.sale_price ?? Infinity));
        break;
      case 'price-desc':
        // Ensure sale_price is treated as a number, default to -Infinity if null/undefined
        sorted.sort((a, b) => (b.sale_price ?? -Infinity) - (a.sale_price ?? -Infinity));
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'default':
      default:
        // Keep original fetched order (which was name asc) or apply other default
        break;
    }
    return sorted;
  }, [filteredProducts, sortOrder]);

  // Use 'sortedProducts' for rendering the grid
  const productsToDisplay = sortedProducts;


  return (
    <div className="bg-gray-50"> {/* Apply background */}
      {/* Navbar removed */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"> {/* Standardize container */}
        {/* Use translation key */}
        <h1 className="text-4xl font-serif text-center mb-12"> {/* Update title style */}
          {t('inventory.title')}
        </h1>

        {/* Filter and Sort Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 p-6 bg-white rounded-lg shadow-md"> {/* Style filter/sort controls */}
          {/* Category Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            {/* Use translation key */}
            <label htmlFor="category-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('inventory.filter_category')}</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={loading || !!error || categories.length <= 1}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:border-[#D4AF37] focus:ring focus:ring-[#D4AF37] focus:ring-opacity-50 sm:text-sm rounded-md bg-white disabled:opacity-50" // Update focus style
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {/* Use translation key */}
                  {category === 'all' ? t('inventory.all_categories') : category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
             {/* Use translation key */}
             <label htmlFor="sort-order" className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('inventory.sort_by')}</label>
             <select
               id="sort-order"
               value={sortOrder}
               onChange={(e) => setSortOrder(e.target.value as SortOption)}
               disabled={loading || !!error || productsToDisplay.length === 0}
               className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:border-[#D4AF37] focus:ring focus:ring-[#D4AF37] focus:ring-opacity-50 sm:text-sm rounded-md bg-white disabled:opacity-50" // Update focus style
             >
               {/* Use translation keys */}
               <option value="default">{t('inventory.sort_default')}</option>
               <option value="price-asc">{t('inventory.sort_price_asc')}</option>
               <option value="price-desc">{t('inventory.sort_price_desc')}</option>
               <option value="name-asc">{t('inventory.sort_name_asc')}</option>
               <option value="name-desc">{t('inventory.sort_name_desc')}</option>
             </select>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner className="h-10 w-10 text-indigo-600" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 bg-red-100 p-4 rounded">
            {error}
          </div>
        )}

        {/* No Products State (considering filters) */}
        {!loading && !error && productsToDisplay.length === 0 && (
           <p className="text-center text-gray-500 py-10">
             {/* Use translation keys */}
             {selectedCategory === 'all'
               ? t('inventory.no_products_available')
               : t('inventory.no_products_in_category', { category: selectedCategory })}
           </p>
        )}

        {/* Products Grid */}
        {!loading && !error && productsToDisplay.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {/* Map over products and render ProductCard component, passing the handler */}
            {productsToDisplay.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickViewClick={openQuickView} // Pass the handler function
              />
            ))}
          </div>
        )}
      </main>
      {/* Footer removed */}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <Modal
          isOpen={isQuickViewOpen}
          onClose={closeQuickView}
          // Use translation key
          title={t('inventory.quick_view_modal_title')}
          // Optional: Adjust modal size if needed via a prop or className
          // size="large" // Example size prop if Modal supports it
        >
          {/* Modal Content */}
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="flex items-center justify-center bg-gray-100 rounded">
              {quickViewProduct.image_url ? (
                <img
                  src={quickViewProduct.image_url}
                  alt={quickViewProduct.name}
                  className="max-h-80 w-auto object-contain rounded"
                />
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  {/* Use translation key */}
                  {t('inventory.no_image')}
                </div>
              )}
            </div>
            {/* Details */}
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{quickViewProduct.name}</h2>
              <p className="text-gray-600 mb-4 flex-grow">
                {/* Use translation key */}
                {quickViewProduct.description || t('inventory.no_description')}
              </p>
              <div className="mt-auto">
                 {/* Price Display Logic */}
                 <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-2xl font-extrabold text-indigo-600">
                        {quickViewProduct.currency === 'SYP' ? 'ل.س' : '$'}{quickViewProduct.sale_price.toFixed(2)}
                    </p>
                    {quickViewProduct.original_price && quickViewProduct.discount_percentage && quickViewProduct.discount_percentage > 0 && quickViewProduct.original_price > quickViewProduct.sale_price && (
                        <p className="text-lg text-gray-500 line-through">
                            {quickViewProduct.currency === 'SYP' ? 'ل.س' : '$'}{quickViewProduct.original_price.toFixed(2)}
                        </p>
                    )}
                 </div>
                {/* Add to Cart button removed */}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div> // Close background div
  );
};

export default Inventory;
