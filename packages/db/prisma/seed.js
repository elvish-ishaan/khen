"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // Create sample restaurants
    const restaurant1 = await prisma.restaurant.create({
        data: {
            slug: 'taj-mahal-restaurant',
            name: 'Taj Mahal Restaurant',
            description: 'Authentic Indian cuisine with a modern twist',
            cuisineType: ['Indian', 'North Indian', 'Mughlai'],
            imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9',
            coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
            addressLine1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            latitude: 19.0760,
            longitude: 72.8777,
            phone: '+91 9876543210',
            email: 'contact@tajmahal.com',
            rating: 4.5,
            totalReviews: 125,
            minOrderAmount: 200,
            deliveryFee: 40,
            estimatedDeliveryTime: 30,
            opensAt: '10:00',
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
                                    description: 'Marinated cottage cheese grilled to perfection',
                                    price: 250,
                                    isVeg: true,
                                    sortOrder: 1,
                                },
                                {
                                    name: 'Chicken Tikka',
                                    description: 'Tender chicken pieces marinated in spices',
                                    price: 280,
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
                                    description: 'Creamy tomato-based curry with tender chicken',
                                    price: 350,
                                    isVeg: false,
                                    sortOrder: 1,
                                },
                                {
                                    name: 'Dal Makhani',
                                    description: 'Slow-cooked black lentils in rich gravy',
                                    price: 220,
                                    isVeg: true,
                                    sortOrder: 2,
                                },
                                {
                                    name: 'Paneer Butter Masala',
                                    description: 'Cottage cheese in rich tomato gravy',
                                    price: 280,
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
                                    price: 50,
                                    isVeg: true,
                                    sortOrder: 1,
                                },
                                {
                                    name: 'Garlic Naan',
                                    description: 'Naan topped with garlic and cilantro',
                                    price: 60,
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
    const restaurant2 = await prisma.restaurant.create({
        data: {
            slug: 'pizza-paradise',
            name: 'Pizza Paradise',
            description: 'Wood-fired pizzas and Italian delights',
            cuisineType: ['Italian', 'Pizza', 'Fast Food'],
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
            coverImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
            addressLine1: '456 Park Avenue',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400002',
            latitude: 19.0896,
            longitude: 72.8656,
            phone: '+91 9876543211',
            email: 'hello@pizzaparadise.com',
            rating: 4.3,
            totalReviews: 89,
            minOrderAmount: 300,
            deliveryFee: 50,
            estimatedDeliveryTime: 40,
            opensAt: '11:00',
            closesAt: '23:30',
            categories: {
                create: [
                    {
                        name: 'Vegetarian Pizzas',
                        sortOrder: 1,
                        items: {
                            create: [
                                {
                                    name: 'Margherita Pizza',
                                    description: 'Classic pizza with tomato sauce, mozzarella, and basil',
                                    price: 299,
                                    isVeg: true,
                                    sortOrder: 1,
                                },
                                {
                                    name: 'Veggie Supreme',
                                    description: 'Loaded with bell peppers, onions, mushrooms, and olives',
                                    price: 399,
                                    isVeg: true,
                                    sortOrder: 2,
                                },
                            ],
                        },
                    },
                    {
                        name: 'Non-Veg Pizzas',
                        sortOrder: 2,
                        items: {
                            create: [
                                {
                                    name: 'Chicken BBQ Pizza',
                                    description: 'BBQ chicken with onions and bell peppers',
                                    price: 449,
                                    isVeg: false,
                                    sortOrder: 1,
                                },
                                {
                                    name: 'Pepperoni Classic',
                                    description: 'Loaded with pepperoni and extra cheese',
                                    price: 479,
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
    const restaurant3 = await prisma.restaurant.create({
        data: {
            slug: 'burger-hub',
            name: 'Burger Hub',
            description: 'Gourmet burgers and loaded fries',
            cuisineType: ['American', 'Burgers', 'Fast Food'],
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
            coverImageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add',
            addressLine1: '789 Food Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400003',
            latitude: 19.1136,
            longitude: 72.8697,
            phone: '+91 9876543212',
            email: 'info@burgerhub.com',
            rating: 4.6,
            totalReviews: 156,
            minOrderAmount: 150,
            deliveryFee: 30,
            estimatedDeliveryTime: 25,
            opensAt: '12:00',
            closesAt: '00:00',
            categories: {
                create: [
                    {
                        name: 'Burgers',
                        sortOrder: 1,
                        items: {
                            create: [
                                {
                                    name: 'Classic Beef Burger',
                                    description: 'Juicy beef patty with lettuce, tomato, and special sauce',
                                    price: 199,
                                    isVeg: false,
                                    sortOrder: 1,
                                },
                                {
                                    name: 'Veggie Burger',
                                    description: 'Plant-based patty with fresh veggies',
                                    price: 179,
                                    isVeg: true,
                                    sortOrder: 2,
                                },
                                {
                                    name: 'Chicken Burger',
                                    description: 'Crispy chicken fillet with mayo and lettuce',
                                    price: 189,
                                    isVeg: false,
                                    sortOrder: 3,
                                },
                            ],
                        },
                    },
                    {
                        name: 'Sides',
                        sortOrder: 2,
                        items: {
                            create: [
                                {
                                    name: 'French Fries',
                                    description: 'Crispy golden fries',
                                    price: 99,
                                    isVeg: true,
                                    sortOrder: 1,
                                },
                                {
                                    name: 'Loaded Fries',
                                    description: 'Fries topped with cheese and jalapenos',
                                    price: 149,
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
    console.log('✅ Database seeded successfully!');
    console.log(`Created ${3} restaurants with menus`);
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
});
