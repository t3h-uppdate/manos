import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchProductBySlug, Product } from '../lib/inventoryApi';
import LoadingSpinner from '../components/LoadingSpinner';
// Removed Navbar and Footer imports as they are handled by MainLayout

// Define the expected URL parameters
interface ProductDetailParams extends Record<string, string | undefined> {
    categorySlug: string;
    productSlug: string;
}

const ProductDetail: React.FC = () => {
  // Destructure both params, but we primarily need productSlug for fetching
  const { categorySlug, productSlug } = useParams<ProductDetailParams>();
  const { t } = useTranslation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      // Use productSlug for fetching and checking
      if (!productSlug) {
        setError(t('product_detail.errors.no_slug', 'Product identifier missing.'));
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductBySlug(productSlug); // Fetch using productSlug
        if (data) {
          // Optional: Verify categorySlug matches product.category if needed for strictness
          // const fetchedCategorySlug = generateSlug(data.category || 'uncategorized');
          // if (categorySlug !== fetchedCategorySlug) {
          //   console.warn(`Category slug mismatch: URL (${categorySlug}) vs Product (${fetchedCategorySlug})`);
          //   // Decide how to handle: redirect, show error, or ignore? For now, ignore.
          // }
          setProduct(data);
        } else {
          setError(t('product_detail.errors.not_found', 'Product not found.'));
        }
      } catch (err) {
        console.error(`Error fetching product with slug "${productSlug}":`, err); // Log using productSlug
        setError(t('product_detail.errors.load', 'Failed to load product details.'));
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
    // Depend on productSlug for re-fetching if the product part of the URL changes
  }, [productSlug, categorySlug, t]); // Include categorySlug in deps array for completeness, though not used for fetch

  // This component renders inside the <main> element of MainLayout
  // Remove the redundant Navbar, Footer, min-h-screen, and <main> tag
  return (
    // Use a fragment or a simple div container for the page content
    <div className="container mx-auto px-4 py-8"> {/* Apply container/padding directly */}
        {/* Back link */}
        <div className="mb-6">
          <Link to="/inventory" className="text-indigo-600 hover:text-indigo-800 hover:underline">
            &larr; {t('product_detail.back_link', 'Back to Inventory')}
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner className="h-12 w-12 text-indigo-600" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 bg-red-100 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{t('common.error', 'Error')}</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && product && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden md:flex">
            {/* Image Section */}
            <div className="md:w-1/2 p-4 flex items-center justify-center bg-gray-100">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="max-h-96 w-auto object-contain rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                        const placeholder = document.createElement('span');
                        placeholder.textContent = t('inventory.image_load_error', 'No Image');
                        placeholder.className = 'text-gray-500 text-lg';
                        parent.appendChild(placeholder);
                    }
                  }}
                />
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  {t('inventory.no_image', 'No Image Available')}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                {product.category && (
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    {product.category}
                  </span>
                )}
                {product.brand && (
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    {product.brand}
                  </span>
                )}
                <p className="text-gray-700 text-base mt-4 mb-6">
                  {product.description || t('product_detail.no_description', 'No description available.')}
                </p>
              </div>
              <div className="mt-6">
                 {/* Price Display Logic */}
                 <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-3xl font-extrabold text-indigo-600">
                        {product.currency === 'SYP' ? 'ل.س' : '$'}{product.sale_price.toFixed(2)}
                    </p>
                    {product.original_price && product.discount_percentage && product.discount_percentage > 0 && product.original_price > product.sale_price && (
                        <p className="text-xl text-gray-500 line-through">
                            {product.currency === 'SYP' ? 'ل.س' : '$'}{product.original_price.toFixed(2)}
                        </p>
                    )}
                    {/* Optional Discount Badge */}
                    {product.discount_percentage && product.discount_percentage > 0 && (
                        <span className="ml-2 bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                            -{product.discount_percentage.toFixed(0)}%
                        </span>
                    )}
                 </div>
                {/* Stock Status */}
                <p className={`text-lg font-semibold ${product.quantity_on_hand > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.quantity_on_hand > 0
                    ? `${t('inventory.in_stock', 'In Stock')} (${product.quantity_on_hand} ${t('product_detail.available', 'available')})`
                    : t('inventory.out_of_stock', 'Out of Stock')}
                </p>
                {/* Optional: Add to Cart Button or other actions */}
                {/* <button className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded transition duration-150 ease-in-out">
                  {t('product_detail.add_to_cart', 'Add to Cart')}
                </button> */}
              </div>
            </div>
          </div>
        )}

         {!loading && !error && !product && (
           // This case handles when loading is done, no error occurred, but product is still null (e.g., slug was invalid but didn't throw error)
           <div className="text-center text-gray-500 py-10">
             {t('product_detail.errors.not_found', 'Product not found.')}
           </div>
         )}

         {!loading && !error && !product && (
           // This case handles when loading is done, no error occurred, but product is still null (e.g., slug was invalid but didn't throw error)
           <div className="text-center text-gray-500 py-10">
             {t('product_detail.errors.not_found', 'Product not found.')}
           </div>
         )}

    </div> // Close the main container div
  );
};

export default ProductDetail;
