'use client';

import { useState, useEffect } from 'react';
import { Leaf, Circle, Pencil, Trash2, Plus, Utensils, CheckCircle } from 'lucide-react';
import { restaurantApi } from '@/lib/api/restaurant.api';
import { onboardingApi } from '@/lib/api/onboarding.api';
import type { Category, MenuItem } from '@/lib/api/restaurant.api';
import { Button } from '@/components/ui/button';

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  // Menu item form state
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemData, setItemData] = useState({
    name: '',
    description: '',
    price: 0,
    isVeg: true,
    isAvailable: true,
  });
  const [itemImage, setItemImage] = useState<File | null>(null);

  const fetchMenu = async () => {
    try {
      const response = await restaurantApi.getMenu();
      if (response.success && response.data?.categories) {
        setCategories(response.data.categories);
        if (response.data.categories?.length > 0 && !selectedCategory) {
          setSelectedCategory(response.data.categories[0]?.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Category handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await onboardingApi.addCategory({
        name: categoryName,
        description: categoryDescription || undefined,
        sortOrder: categories.length,
      });

      if (response.success) {
        setSuccess('Category added successfully!');
        setCategoryName('');
        setCategoryDescription('');
        setShowCategoryForm(false);
        await fetchMenu();
      } else {
        setError(response.error || 'Failed to add category');
      }
    } catch (err) {
      setError('Failed to add category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await onboardingApi.updateCategory(editingCategory.id, {
        name: categoryName,
        description: categoryDescription || undefined,
      });

      if (response.success) {
        setSuccess('Category updated successfully!');
        setCategoryName('');
        setCategoryDescription('');
        setEditingCategory(null);
        setShowCategoryForm(false);
        await fetchMenu();
      } else {
        setError(response.error || 'Failed to update category');
      }
    } catch (err) {
      setError('Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? All items in this category will be deleted.')) {
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await onboardingApi.deleteCategory(categoryId);

      if (response.success) {
        setSuccess('Category deleted successfully!');
        if (selectedCategory === categoryId) {
          setSelectedCategory(null);
        }
        await fetchMenu();
      } else {
        setError(response.error || 'Failed to delete category');
      }
    } catch (err) {
      setError('Failed to delete category');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setShowCategoryForm(true);
  };

  const cancelCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
  };

  // Menu item handlers
  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('categoryId', selectedCategory);
      formData.append('name', itemData.name);
      if (itemData.description) formData.append('description', itemData.description);
      formData.append('price', itemData.price.toString());
      formData.append('isVeg', itemData.isVeg.toString());
      formData.append('isAvailable', itemData.isAvailable.toString());
      if (itemImage) formData.append('itemImage', itemImage);

      const response = await onboardingApi.addMenuItem(formData);

      if (response.success) {
        setSuccess('Menu item added successfully!');
        setItemData({ name: '', description: '', price: 0, isVeg: true, isAvailable: true });
        setItemImage(null);
        setShowItemForm(false);
        await fetchMenu();
      } else {
        setError(response.error || 'Failed to add menu item');
      }
    } catch (err) {
      setError('Failed to add menu item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', itemData.name);
      if (itemData.description) formData.append('description', itemData.description);
      formData.append('price', itemData.price.toString());
      formData.append('isVeg', itemData.isVeg.toString());
      formData.append('isAvailable', itemData.isAvailable.toString());
      if (itemImage) formData.append('itemImage', itemImage);

      const response = await onboardingApi.updateMenuItem(editingItem.id, formData);

      if (response.success) {
        setSuccess('Menu item updated successfully!');
        setItemData({ name: '', description: '', price: 0, isVeg: true, isAvailable: true });
        setItemImage(null);
        setEditingItem(null);
        setShowItemForm(false);
        await fetchMenu();
      } else {
        setError(response.error || 'Failed to update menu item');
      }
    } catch (err) {
      setError('Failed to update menu item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await onboardingApi.deleteMenuItem(itemId);

      if (response.success) {
        setSuccess('Menu item deleted successfully!');
        await fetchMenu();
      } else {
        setError(response.error || 'Failed to delete menu item');
      }
    } catch (err) {
      setError('Failed to delete menu item');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
    });
    setShowItemForm(true);
  };

  const cancelItemForm = () => {
    setShowItemForm(false);
    setEditingItem(null);
    setItemData({ name: '', description: '', price: 0, isVeg: true, isAvailable: true });
    setItemImage(null);
  };

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Menu Management</h1>
        <p className="text-gray-600">Manage your restaurant menu, categories, and items</p>
      </div>

      {(error || success) && (
        <div className="mb-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-2">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-gray-600" />
                <h2 className="font-bold text-lg text-gray-900">Categories</h2>
              </div>
              <button
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {showCategoryForm && (
              <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-sm font-medium mb-3">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h3>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Category name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-yellow-500 outline-none"
                  required
                />
                <textarea
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-yellow-500 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-yellow-500 text-gray-900 py-2 rounded-lg text-sm hover:bg-yellow-600 disabled:opacity-50"
                  >
                    {editingCategory ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelCategoryForm}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`
                    rounded-lg transition-all cursor-pointer
                    ${
                      selectedCategory === category.id
                        ? 'bg-yellow-50 border-l-4 border-yellow-500 shadow-sm'
                        : 'bg-white border-l-4 border-transparent hover:bg-gray-50'
                    }
                  `}
                >
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className="w-full text-left px-4 py-3"
                  >
                    <div className={`font-semibold ${selectedCategory === category.id ? 'text-yellow-700' : 'text-gray-900'}`}>
                      {category.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {category.items?.length || 0} items
                    </div>
                  </button>
                  <div className="px-4 pb-3 flex gap-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => startEditCategory(category)}
                      className="flex items-center gap-1 text-xs font-medium text-yellow-600 hover:text-yellow-700 transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
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
                  <h2 className="font-bold text-lg text-gray-900">{selectedCategoryData?.name} Items</h2>
                  <button
                    onClick={() => setShowItemForm(!showItemForm)}
                    className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                {showItemForm && (
                  <form onSubmit={editingItem ? handleUpdateMenuItem : handleAddMenuItem} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="text-sm font-medium mb-3">
                      {editingItem ? 'Edit Menu Item' : 'New Menu Item'}
                    </h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={itemData.name}
                        onChange={(e) => setItemData({ ...itemData, name: e.target.value })}
                        placeholder="Item name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                        required
                      />
                      <textarea
                        value={itemData.description}
                        onChange={(e) => setItemData({ ...itemData, description: e.target.value })}
                        placeholder="Description (optional)"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemData.price}
                        onChange={(e) => setItemData({ ...itemData, price: Number(e.target.value) })}
                        placeholder="Price (₹)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                        required
                      />
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={itemData.isVeg}
                            onChange={() => setItemData({ ...itemData, isVeg: true })}
                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                          />
                          <Leaf className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">Veg</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={!itemData.isVeg}
                            onChange={() => setItemData({ ...itemData, isVeg: false })}
                            className="w-4 h-4 text-red-600 focus:ring-red-500"
                          />
                          <Circle className="w-4 h-4 text-red-600 fill-red-600" />
                          <span className="text-sm font-medium">Non-Veg</span>
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isAvailable"
                          checked={itemData.isAvailable}
                          onChange={(e) => setItemData({ ...itemData, isAvailable: e.target.checked })}
                          className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                          Available for ordering
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {editingItem ? 'Update Image (optional)' : 'Item Image (optional)'}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setItemImage(e.target.files?.[0] || null)}
                          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 cursor-pointer"
                        />
                        {itemImage && (
                          <p className="mt-2 flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle className="w-4 h-4" />
                            New image selected
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 bg-yellow-500 text-gray-900 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                        >
                          {editingItem ? 'Update Item' : 'Add Item'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelItemForm}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {selectedCategoryData?.items?.map((item) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-xl bg-white hover:border-yellow-300 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {item.isVeg ? (
                              <Leaf className="w-4 h-4 text-green-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-red-600 fill-red-600" />
                            )}
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            {!item.isAvailable && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                Unavailable
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                          )}
                          <p className="text-yellow-600 font-bold text-lg">₹{item.price}</p>
                        </div>
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg shadow-sm"
                          />
                        )}
                      </div>
                      <div className="mt-4 flex gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => startEditItem(item)}
                          className="flex items-center gap-1.5 text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
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
                <p className="text-lg">Select a category to manage menu items</p>
                {categories.length === 0 && (
                  <p className="text-sm mt-2">Start by creating a category</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
