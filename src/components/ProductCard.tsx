import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Product, generateSlug } from '../lib/inventoryApi';

interface ProductCardProps {
  product: Product;
  onQuickViewClick: (product: Product) => void; // Add prop for quick view click handler
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickViewClick }) => {
  const { t } = useTranslation();

  // Generate slugs safely, providing fallbacks
  const categorySlug = generateSlug(product.category || 'uncategorized');
  const productSlug = product.slug || 'no-slug'; // Fallback if slug is somehow missing

  const currencySymbol = product.currency === 'SYP' ? 'ل.س' : '$'; // Determine currency symbol
  const displayOriginalPrice = product.original_price && product.discount_percentage && product.discount_percentage > 0 && product.original_price > product.sale_price;
  const discountValue = product.discount_percentage ?? 0;

  // Prevent linking if product slug is missing (or handle differently)
  if (productSlug === 'no-slug') {
    console.warn(`ProductCard: Product ID ${product.id} (${product.name}) is missing a slug.`);
    // Render the card without a link or with a disabled state
    return (
       <div className="border rounded-lg overflow-hidden shadow-sm flex flex-col bg-white opacity-50 cursor-not-allowed relative"> {/* Added relative for badge */}
         {/* Image Section */}
         <div className="w-full h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
            {/* Discount Badge (for non-linked card) */}
            {discountValue > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
                    -{discountValue.toFixed(0)}% {/* Show integer percentage */}
                </span>
            )}
           {product.image_url ? (
             <img
               src={product.image_url}
               alt={product.name}
               className="w-full h-full object-cover"
               loading="lazy"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 const parent = e.currentTarget.parentElement;
                 if (parent && !parent.querySelector('.placeholder-text')) {
                   const placeholder = document.createElement('span');
                   placeholder.textContent = t('inventory.image_load_error', 'No Image');
                   placeholder.className = 'text-gray-500 text-sm placeholder-text';
                   parent.appendChild(placeholder);
                 }
               }}
             />
           ) : (
             <span className="text-gray-500 text-sm placeholder-text">{t('inventory.no_image', 'No Image Available')}</span>
           )}
         </div>
         {/* Details Section */}
         <div className="p-4 flex flex-col flex-grow">
           <h3 className="text-md font-semibold text-gray-800 mb-2 truncate" title={product.name}>
             {product.name}
           </h3>
           <div className="mt-auto flex items-baseline justify-between">
             <p className="text-lg font-bold text-indigo-600">
               {currencySymbol}{product.sale_price.toFixed(2)}
             </p>
             {displayOriginalPrice && product.original_price && (
                <p className="text-sm text-gray-500 line-through ml-2">
                    {currencySymbol}{product.original_price.toFixed(2)}
                </p>
             )}
           </div>
         </div>
       </div>
    );
  }

  // Render the card with a link
  return (
    <Link
      to={`/product/${categorySlug}/${productSlug}`} // Use new URL structure
       className="border rounded-lg overflow-hidden shadow-sm flex flex-col bg-white hover:shadow-lg transition-shadow duration-200 group relative"
    >
      {/* Image Section */}
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
         {/* Discount Badge */}
         {discountValue > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
                -{discountValue.toFixed(0)}% {/* Show integer percentage */}
            </span>
         )}
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" // Added hover effect
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent && !parent.querySelector('.placeholder-text')) {
                const placeholder = document.createElement('span');
                placeholder.textContent = t('inventory.image_load_error', 'No Image');
                placeholder.className = 'text-gray-500 text-sm placeholder-text';
                parent.appendChild(placeholder);
              }
            }}
          />
        ) : (
          <span className="text-gray-500 text-sm placeholder-text">{t('inventory.no_image', 'No Image Available')}</span>
        )}
         {/* Quick View Button - Appears on Hover */}
         <button
            onClick={(e) => {
              e.preventDefault(); // Prevent Link navigation
              e.stopPropagation(); // Stop event bubbling
              onQuickViewClick(product); // Call the passed handler
            }}
            aria-label={t('inventory.quick_view_label', 'Quick view {productName}', { productName: product.name })}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
         >
            {t('inventory.quick_view_button', 'Quick View')}
         </button>
      </div>

      {/* Details Section - The Link wraps this part too */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-md font-semibold text-gray-800 mb-2 truncate group-hover:text-indigo-600" title={product.name}>
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline justify-between">
          <p className="text-lg font-bold text-indigo-600">
            {currencySymbol}{product.sale_price.toFixed(2)}
          </p>
          {displayOriginalPrice && product.original_price && (
             <p className="text-sm text-gray-500 line-through ml-2">
                 {currencySymbol}{product.original_price.toFixed(2)}
             </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
