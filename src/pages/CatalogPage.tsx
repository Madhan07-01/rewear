import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { DigitalPassportModal } from '../components/DigitalPassportModal';
import { Search, Filter, SlidersHorizontal, MapPin, Grid, List, Sparkles } from 'lucide-react';

interface CatalogPageProps {
  onSelectProduct: (product: Product) => void;
  initialCategory?: string;
  initialOccasion?: string;
  initialSearch?: string;
  savedOnly?: boolean;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  onSelectProduct,
  initialCategory,
  initialOccasion,
  initialSearch,
  savedOnly
}) => {
  const { savedProductIds, selectedCity } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPassportProduct, setSelectedPassportProduct] = useState<Product | null>(null);

  // Filters
  const [search, setSearch] = useState(initialSearch || '');
  const [category, setCategory] = useState(initialCategory || 'All');
  const [occasion, setOccasion] = useState(initialOccasion || 'All');
  const [size, setSize] = useState('All');
  const [maxBudget, setMaxBudget] = useState<number>(5000);
  const [showSavedOnly, setShowSavedOnly] = useState(Boolean(savedOnly));

  const categories = ['All', 'Gown', 'Lehenga', 'Saree', 'Blazer', 'Anarkali', 'Party Dress', 'Kurta Set', 'Sherwani'];
  const occasions = ['All', 'Farewell', 'Wedding', 'Interview', 'Party', 'College event', 'Photoshoot', 'Traditional'];
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'Free Size'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (occasion !== 'All') params.append('occasion', occasion);
      if (size !== 'All') params.append('size', size);
      if (maxBudget) params.append('maxBudget', String(maxBudget));
      if (search.trim()) params.append('search', search.trim());
      params.append('city', selectedCity);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, occasion, size, maxBudget, search, selectedCity]);

  const filteredProducts = showSavedOnly
    ? products.filter(p => savedProductIds.includes(p.id))
    : products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#781F37] block mb-1">
            Hyperlocal Circular Wardrobe
          </span>
          <h1 className="font-serif-couture text-3xl sm:text-4xl font-bold text-[#18212B]">
            Browse Available Outfits in {selectedCity}
          </h1>
          <p className="text-xs text-[#6F747A] mt-1">
            Showing {filteredProducts.length} verified pieces available for fast pickup and delivery.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-80 flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-[#E8E1D8] shadow-xs">
          <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gown, lehenga, blazer..."
            className="w-full bg-transparent text-xs text-[#18212B] focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-stone-400 hover:text-black">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Segmented Controls */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8] shadow-xs mb-8 space-y-4">
        {/* Category Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 font-medium mr-2 flex-shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex-shrink-0 ${
                category === cat
                  ? 'bg-[#781F37] text-white shadow-xs'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Occasion & Size Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100 text-xs">
          {/* Occasion */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-medium">Occasion:</span>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 text-[#18212B] font-medium"
            >
              {occasions.map((occ) => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-medium">Size:</span>
            <div className="flex items-center gap-1">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    size === s ? 'bg-[#18212B] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Saved Toggle */}
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              showSavedOnly
                ? 'bg-[#781F37]/10 border-[#781F37] text-[#781F37]'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Saved Outfits ({savedProductIds.length})
          </button>
        </div>
      </div>

      {/* Grid Results */}
      {loading ? (
        <div className="text-center py-16 text-stone-500 text-xs">
          Loading circular fashion catalog...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E1D8] space-y-3">
          <p className="font-serif-couture text-xl text-[#18212B]">
            No outfits found matching your filters.
          </p>
          <p className="text-xs text-[#6F747A]">
            Try relaxing your budget, occasion, or size filters to see more pieces.
          </p>
          <button
            onClick={() => {
              setCategory('All');
              setOccasion('All');
              setSize('All');
              setSearch('');
              setShowSavedOnly(false);
            }}
            className="px-4 py-2 bg-[#781F37] text-white rounded-xl text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onOpenPassport={(p) => setSelectedPassportProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Digital Passport Modal */}
      {selectedPassportProduct && (
        <DigitalPassportModal
          product={selectedPassportProduct}
          onClose={() => setSelectedPassportProduct(null)}
        />
      )}
    </div>
  );
};
