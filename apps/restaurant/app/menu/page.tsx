'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingApi } from '@/lib/api/onboarding.api';
import { Stepper } from '@/components/onboarding/stepper';

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
}

export default function MenuPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  // Menu item form
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemData, setItemData] = useState({
    name: '',
    description: '',
    price: 0,
    isVeg: true,
  });
  const [itemImage, setItemImage] = useState<File | null>(null);

  const fetchStatus = async () => {
    const response = await onboardingApi.getStatus();
    if (response.success && response.data?.restaurant) {
      const cats = response.data.restaurant.categories || [];
      setCategories(cats);
      if (cats.length > 0 && !selectedCategory) {
        setSelectedCategory(cats[0].id);
      }
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await onboardingApi.addCategory({
        name: categoryName,
        sortOrder: categories.length,
      });

      if (response.success) {
        setCategoryName('');
        setShowCategoryForm(false);
        await fetchStatus();
      } else {
        setError(response.error || 'Failed to add category');
      }
    } catch (err) {
      setError('Failed to add category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('categoryId', selectedCategory);
      formData.append('name', itemData.name);
      if (itemData.description) formData.append('description', itemData.description);
      formData.append('price', itemData.price.toString());
      formData.append('isVeg', itemData.isVeg.toString());
      if (itemImage) formData.append('itemImage', itemImage);

      const response = await onboardingApi.addMenuItem(formData);

      if (response.success) {
        setItemData({ name: '', description: '', price: 0, isVeg: true });
        setItemImage(null);
        setShowItemForm(false);
        await fetchStatus();
      } else {
        setError(response.error || 'Failed to add menu item');
      }
    } catch (err) {
      setError('Failed to add menu item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (categories.length === 0) {
      setError('Please add at least one category');
      return;
    }

    const hasItems = categories.some((cat) => cat.items && cat.items.length > 0);
    if (!hasItems) {
      setError('Please add at least one menu item');
      return;
    }

    router.push('/location');
  };

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <div>
      <Stepper currentStep={4} />

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">Build Your Menu</h1>
        <p className="text-gray-600 mb-6">
          Add categories and menu items
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Categories</h2>
              <button
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Add
              </button>
            </div>

            {showCategoryForm && (
              <form onSubmit={handleAddCategory} className="mb-4">
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Category name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-primary-600 text-white py-2 rounded-lg text-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(false)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg transition-colors
                    ${
                      selectedCategory === category.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }
                  `}
                >
                  <div className="font-medium">{category.name}</div>
                  <div className={`text-sm ${selectedCategory === category.id ? 'text-primary-100' : 'text-gray-500'}`}>
                    {category.items?.length || 0} items
                  </div>
                </button>
              ))}

              {categories.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No categories yet
                </p>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-2">
            {selectedCategory ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold">{selectedCategoryData?.name} Items</h2>
                  <button
                    onClick={() => setShowItemForm(!showItemForm)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    + Add Item
                  </button>
                </div>

                {showItemForm && (
                  <form onSubmit={handleAddMenuItem} className="mb-6 p-4 border border-gray-200 rounded-lg">
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={itemData.name}
                        onChange={(e) => setItemData({ ...itemData, name: e.target.value })}
                        placeholder="Item name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        required
                      />
                      <textarea
                        value={itemData.description}
                        onChange={(e) => setItemData({ ...itemData, description: e.target.value })}
                        placeholder="Description (optional)"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemData.price}
                        onChange={(e) => setItemData({ ...itemData, price: Number(e.target.value) })}
                        placeholder="Price (₹)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        required
                      />
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={itemData.isVeg}
                            onChange={() => setItemData({ ...itemData, isVeg: true })}
                            className="text-primary-600"
                          />
                          <span className="text-sm">🟢 Veg</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={!itemData.isVeg}
                            onChange={() => setItemData({ ...itemData, isVeg: false })}
                            className="text-primary-600"
                          />
                          <span className="text-sm">🔴 Non-Veg</span>
                        </label>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setItemImage(e.target.files?.[0] || null)}
                        className="w-full text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 bg-primary-600 text-white py-2 rounded-lg"
                        >
                          Add Item
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowItemForm(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {selectedCategoryData?.items?.map((item) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{item.isVeg ? '🟢' : '🔴'}</span>
                            <h3 className="font-medium">{item.name}</h3>
                          </div>
                          <p className="text-primary-600 font-semibold mt-1">₹{item.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!selectedCategoryData?.items || selectedCategoryData.items.length === 0) && (
                    <p className="text-gray-500 text-sm text-center py-8">
                      No items in this category yet
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Select a category to add menu items</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.push('/restaurant-info')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            className="bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700"
          >
            Continue to Location
          </button>
        </div>
      </div>
    </div>
  );
}
