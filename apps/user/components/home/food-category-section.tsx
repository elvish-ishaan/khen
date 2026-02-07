'use client';

import { useRouter } from 'next/navigation';
import { Coffee, Utensils, Leaf, Cake, Beer, Soup, UtensilsCrossed, Pizza, Croissant, IceCream } from 'lucide-react';

const categories = [
  { id: 'biryani', name: 'Biryani', icon: Soup, searchQuery: 'Biryani' },
  { id: 'snacks', name: 'Snacks', icon: Coffee, searchQuery: 'Snacks' },
  { id: 'curry', name: 'Curry', icon: Utensils, searchQuery: 'Curry' },
  { id: 'thali', name: 'Thali', icon: UtensilsCrossed, searchQuery: 'Thali' },
  { id: 'south-indian', name: 'South Indian', icon: Croissant, searchQuery: 'Dosa' },
  { id: 'street-food', name: 'Street Food', icon: Pizza, searchQuery: 'Chaat' },
  { id: 'chinese', name: 'Chinese', icon: Leaf, searchQuery: 'Noodles' },
  { id: 'dessert', name: 'Dessert', icon: Cake, searchQuery: 'Dessert' },
  { id: 'breakfast', name: 'Breakfast', icon: Beer, searchQuery: 'Breakfast' },
  { id: 'sweets', name: 'Sweets', icon: IceCream, searchQuery: 'Sweets' },
];

export function FoodCategorySection() {
  const router = useRouter();

  const handleCategoryClick = (searchQuery: string) => {
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="px-4 py-6">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.searchQuery)}
              className="flex flex-col items-center gap-2 flex-shrink-0 group"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all bg-yellow-100 group-hover:bg-yellow-200 group-active:bg-yellow-500 group-active:scale-110">
                <Icon
                  className="w-7 h-7 text-yellow-700 group-active:text-white"
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center max-w-[70px]">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
