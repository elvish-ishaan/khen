import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.favoriteRestaurant.deleteMany();
  await prisma.restaurant.deleteMany();

  // Restaurant 1: Pizza Palace
  const pizzaPalace = await prisma.restaurant.create({
    data: {
      slug: 'pizza-palace',
      name: 'Pizza Palace',
      description: 'Authentic Italian pizzas with fresh ingredients and wood-fired oven',
      cuisineType: ['Italian', 'Pizza'],
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
      coverImageUrl: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=1200',
      addressLine1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      latitude: 19.0760,
      longitude: 72.8777,
      phone: '+919876543210',
      email: 'contact@pizzapalace.com',
      rating: 4.5,
      totalReviews: 328,
      minOrderAmount: 200,
      deliveryFee: 40,
      estimatedDeliveryTime: 30,
      opensAt: '11:00',
      closesAt: '23:00',
      categories: {
        create: [
          {
            name: 'Veg Pizzas',
            description: 'Delicious vegetarian pizzas',
            sortOrder: 1,
            items: {
              create: [
                {
                  name: 'Margherita Pizza',
                  description: 'Classic pizza with tomato sauce, mozzarella, and basil',
                  price: 299,
                  imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
                  isVeg: true,
                  sortOrder: 1,
                },
                {
                  name: 'Veggie Supreme',
                  description: 'Loaded with bell peppers, onions, mushrooms, olives, and tomatoes',
                  price: 399,
                  imageUrl: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=500',
                  isVeg: true,
                  sortOrder: 2,
                },
                {
                  name: 'Corn & Cheese',
                  description: 'Sweet corn with extra mozzarella cheese',
                  price: 349,
                  isVeg: true,
                  sortOrder: 3,
                },
              ],
            },
          },
          {
            name: 'Non-Veg Pizzas',
            description: 'Pizzas with meat toppings',
            sortOrder: 2,
            items: {
              create: [
                {
                  name: 'Chicken BBQ',
                  description: 'Grilled chicken with BBQ sauce and onions',
                  price: 449,
                  imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
                  isVeg: false,
                  sortOrder: 1,
                },
                {
                  name: 'Pepperoni Feast',
                  description: 'Loaded with pepperoni and extra cheese',
                  price: 479,
                  isVeg: false,
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            name: 'Sides & Beverages',
            sortOrder: 3,
            items: {
              create: [
                {
                  name: 'Garlic Bread',
                  description: 'Crispy garlic bread with herb butter',
                  price: 99,
                  isVeg: true,
                  sortOrder: 1,
                },
                {
                  name: 'Coke (500ml)',
                  price: 50,
                  isVeg: true,
                  sortOrder: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Restaurant 2: Burger King
  const burgerKing = await prisma.restaurant.create({
    data: {
      slug: 'burger-king',
      name: 'Burger King',
      description: 'Flame-grilled burgers and crispy fries',
      cuisineType: ['American', 'Fast Food', 'Burgers'],
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
      coverImageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200',
      addressLine1: '456 Park Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400002',
      latitude: 19.0896,
      longitude: 72.8656,
      phone: '+919876543211',
      email: 'info@burgerking.com',
      rating: 4.3,
      totalReviews: 512,
      minOrderAmount: 150,
      deliveryFee: 30,
      estimatedDeliveryTime: 25,
      opensAt: '10:00',
      closesAt: '23:30',
      categories: {
        create: [
          {
            name: 'Veg Burgers',
            sortOrder: 1,
            items: {
              create: [
                {
                  name: 'Veggie Whopper',
                  description: 'Plant-based patty with fresh vegetables',
                  price: 199,
                  imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500',
                  isVeg: true,
                  sortOrder: 1,
                },
                {
                  name: 'Aloo Tikki Burger',
                  description: 'Crispy potato patty with special sauce',
                  price: 89,
                  isVeg: true,
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            name: 'Non-Veg Burgers',
            sortOrder: 2,
            items: {
              create: [
                {
                  name: 'Chicken Whopper',
                  description: 'Flame-grilled chicken with fresh lettuce and tomato',
                  price: 229,
                  imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500',
                  isVeg: false,
                  sortOrder: 1,
                },
                {
                  name: 'Double Chicken Burger',
                  description: 'Two chicken patties with cheese and special sauce',
                  price: 299,
                  isVeg: false,
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            name: 'Fries & Drinks',
            sortOrder: 3,
            items: {
              create: [
                {
                  name: 'French Fries (Regular)',
                  description: 'Crispy golden fries',
                  price: 79,
                  isVeg: true,
                  sortOrder: 1,
                },
                {
                  name: 'Pepsi (500ml)',
                  price: 50,
                  isVeg: true,
                  sortOrder: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Restaurant 3: Spice Junction
  const spiceJunction = await prisma.restaurant.create({
    data: {
      slug: 'spice-junction',
      name: 'Spice Junction',
      description: 'Authentic North Indian cuisine with rich flavors',
      cuisineType: ['Indian', 'North Indian', 'Tandoori'],
      imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
      coverImageUrl: 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=1200',
      addressLine1: '789 Spice Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400003',
      latitude: 19.1136,
      longitude: 72.8697,
      phone: '+919876543212',
      email: 'orders@spicejunction.com',
      rating: 4.7,
      totalReviews: 892,
      minOrderAmount: 250,
      deliveryFee: 50,
      estimatedDeliveryTime: 40,
      opensAt: '12:00',
      closesAt: '23:00',
      categories: {
        create: [
          {
            name: 'Starters',
            sortOrder: 1,
            items: {
              create: [
                {
                  name: 'Paneer Tikka',
                  description: 'Grilled cottage cheese with spices',
                  price: 249,
                  imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500',
                  isVeg: true,
                  sortOrder: 1,
                },
                {
                  name: 'Chicken Tikka',
                  description: 'Marinated chicken pieces grilled to perfection',
                  price: 299,
                  isVeg: false,
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            name: 'Main Course',
            sortOrder: 2,
            items: {
              create: [
                {
                  name: 'Butter Chicken',
                  description: 'Creamy tomato curry with tender chicken',
                  price: 349,
                  imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500',
                  isVeg: false,
                  sortOrder: 1,
                },
                {
                  name: 'Dal Makhani',
                  description: 'Black lentils cooked with butter and cream',
                  price: 229,
                  isVeg: true,
                  sortOrder: 2,
                },
                {
                  name: 'Paneer Butter Masala',
                  description: 'Cottage cheese in rich tomato gravy',
                  price: 279,
                  isVeg: true,
                  sortOrder: 3,
                },
              ],
            },
          },
          {
            name: 'Breads',
            sortOrder: 3,
            items: {
              create: [
                {
                  name: 'Butter Naan',
                  description: 'Soft leavened bread with butter',
                  price: 49,
                  isVeg: true,
                  sortOrder: 1,
                },
                {
                  name: 'Garlic Naan',
                  description: 'Naan with garlic and coriander',
                  price: 59,
                  isVeg: true,
                  sortOrder: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Restaurant 4: Sushi House
  const sushiHouse = await prisma.restaurant.create({
    data: {
      slug: 'sushi-house',
      name: 'Sushi House',
      description: 'Fresh sushi and Japanese cuisine',
      cuisineType: ['Japanese', 'Sushi', 'Asian'],
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
      coverImageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200',
      addressLine1: '321 Ocean Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400004',
      latitude: 19.0607,
      longitude: 72.8300,
      phone: '+919876543213',
      email: 'hello@sushihouse.com',
      rating: 4.6,
      totalReviews: 445,
      minOrderAmount: 300,
      deliveryFee: 60,
      estimatedDeliveryTime: 35,
      opensAt: '12:00',
      closesAt: '22:00',
      categories: {
        create: [
          {
            name: 'Veg Sushi Rolls',
            sortOrder: 1,
            items: {
              create: [
                {
                  name: 'Cucumber Roll',
                  description: 'Fresh cucumber with sesame seeds',
                  price: 199,
                  imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
                  isVeg: true,
                  sortOrder: 1,
                },
                {
                  name: 'Avocado Roll',
                  description: 'Creamy avocado wrapped in seaweed',
                  price: 249,
                  isVeg: true,
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            name: 'Non-Veg Sushi',
            sortOrder: 2,
            items: {
              create: [
                {
                  name: 'Salmon Nigiri (4 pcs)',
                  description: 'Fresh salmon on seasoned rice',
                  price: 399,
                  imageUrl: 'https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=500',
                  isVeg: false,
                  sortOrder: 1,
                },
                {
                  name: 'California Roll',
                  description: 'Crab, avocado, and cucumber',
                  price: 349,
                  isVeg: false,
                  sortOrder: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Restaurant 5: Dosa Corner
  const dosaCorner = await prisma.restaurant.create({
    data: {
      slug: 'dosa-corner',
      name: 'Dosa Corner',
      description: 'Crispy dosas and South Indian delicacies',
      cuisineType: ['South Indian', 'Dosa', 'Breakfast'],
      imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800',
      coverImageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=1200',
      addressLine1: '555 Temple Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400005',
      latitude: 19.0330,
      longitude: 72.8479,
      phone: '+919876543214',
      email: 'info@dosacorner.com',
      rating: 4.4,
      totalReviews: 756,
      minOrderAmount: 150,
      deliveryFee: 35,
      estimatedDeliveryTime: 30,
      opensAt: '07:00',
      closesAt: '22:00',
      categories: {
        create: [
          {
            name: 'Dosas',
            sortOrder: 1,
            items: {
              create: [
                {
                  name: 'Masala Dosa',
                  description: 'Crispy dosa with potato filling',
                  price: 99,
                  imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500',
                  isVeg: true,
                  sortOrder: 1,
                },
                {
                  name: 'Cheese Dosa',
                  description: 'Dosa loaded with melted cheese',
                  price: 149,
                  isVeg: true,
                  sortOrder: 2,
                },
                {
                  name: 'Plain Dosa',
                  description: 'Classic crispy dosa',
                  price: 79,
                  isVeg: true,
                  sortOrder: 3,
                },
              ],
            },
          },
          {
            name: 'Idli & Vada',
            sortOrder: 2,
            items: {
              create: [
                {
                  name: 'Idli (3 pcs)',
                  description: 'Steamed rice cakes with chutney and sambar',
                  price: 69,
                  isVeg: true,
                  sortOrder: 1,
                },
                {
                  name: 'Medu Vada (2 pcs)',
                  description: 'Crispy lentil donuts',
                  price: 79,
                  isVeg: true,
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            name: 'Beverages',
            sortOrder: 3,
            items: {
              create: [
                {
                  name: 'Filter Coffee',
                  description: 'South Indian style filter coffee',
                  price: 49,
                  isVeg: true,
                  sortOrder: 1,
                },
                {
                  name: 'Masala Chai',
                  price: 39,
                  isVeg: true,
                  sortOrder: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Restaurant 6: Thai Express
  const thaiExpress = await prisma.restaurant.create({
    data: {
      slug: 'thai-express',
      name: 'Thai Express',
      description: 'Authentic Thai flavors and spicy curries',
      cuisineType: ['Thai', 'Asian', 'Noodles'],
      imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
      coverImageUrl: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=1200',
      addressLine1: '888 Bangkok Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400006',
      latitude: 19.1197,
      longitude: 72.9081,
      phone: '+919876543215',
      email: 'contact@thaiexpress.com',
      rating: 4.5,
      totalReviews: 623,
      minOrderAmount: 250,
      deliveryFee: 45,
      estimatedDeliveryTime: 35,
      opensAt: '11:30',
      closesAt: '23:00',
      categories: {
        create: [
          {
            name: 'Noodles & Rice',
            sortOrder: 1,
            items: {
              create: [
                {
                  name: 'Pad Thai (Veg)',
                  description: 'Stir-fried rice noodles with vegetables',
                  price: 249,
                  imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500',
                  isVeg: true,
                  sortOrder: 1,
                },
                {
                  name: 'Pad Thai (Chicken)',
                  description: 'Stir-fried rice noodles with chicken',
                  price: 299,
                  isVeg: false,
                  sortOrder: 2,
                },
                {
                  name: 'Thai Fried Rice (Veg)',
                  description: 'Fragrant fried rice with vegetables',
                  price: 229,
                  isVeg: true,
                  sortOrder: 3,
                },
              ],
            },
          },
          {
            name: 'Curries',
            sortOrder: 2,
            items: {
              create: [
                {
                  name: 'Green Curry (Veg)',
                  description: 'Creamy coconut curry with vegetables',
                  price: 279,
                  imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500',
                  isVeg: true,
                  sortOrder: 1,
                },
                {
                  name: 'Red Curry (Chicken)',
                  description: 'Spicy red curry with chicken',
                  price: 329,
                  isVeg: false,
                  sortOrder: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Successfully seeded:');
  console.log(`   - ${pizzaPalace.name}`);
  console.log(`   - ${burgerKing.name}`);
  console.log(`   - ${spiceJunction.name}`);
  console.log(`   - ${sushiHouse.name}`);
  console.log(`   - ${dosaCorner.name}`);
  console.log(`   - ${thaiExpress.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
