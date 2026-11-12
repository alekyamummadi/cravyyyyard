import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db.js';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import Review from './models/Review.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Restaurant.deleteMany({}),
      Review.deleteMany({}),
    ]);

    console.log('[Seed] Creating Users...');
    // All passwords satisfy: 8-16 chars, at least 1 upper, 1 lower, 1 digit, 1 special char
    const admin = await User.create({
      name: 'Platform Administrator',
      email: 'admin@platform.com',
      password: 'Admin@1234',
      role: 'admin',
    });

    const owner1 = await User.create({
      name: 'Mario Rossi',
      email: 'owner.mario@platform.com',
      password: 'Owner@1234',
      role: 'owner',
    });

    const owner2 = await User.create({
      name: 'Sakura Tanaka',
      email: 'owner.sakura@platform.com',
      password: 'Owner@1234',
      role: 'owner',
    });

    const owner3 = await User.create({
      name: 'Priya Sharma',
      email: 'owner.priya@platform.com',
      password: 'Owner@1234',
      role: 'owner',
    });

    const customer1 = await User.create({
      name: 'Alex Johnson',
      email: 'customer.alex@example.com',
      password: 'Customer@1234',
      role: 'customer',
    });

    const customer2 = await User.create({
      name: 'Sarah Miller',
      email: 'customer.sarah@example.com',
      password: 'Customer@1234',
      role: 'customer',
    });

    const customer3 = await User.create({
      name: 'David Chen',
      email: 'customer.david@example.com',
      password: 'Customer@1234',
      role: 'customer',
    });

    const customer4 = await User.create({
      name: 'Emma Watson',
      email: 'customer.emma@example.com',
      password: 'Customer@1234',
      role: 'customer',
    });

    console.log('[Seed] Creating Restaurants...');
    const rest1 = await Restaurant.create({
      name: 'Chennai Dosa House',
      cuisine: 'South Indian',
      location: 'Chennai',
      openingHours: '11:30 AM - 10:30 PM',
      description: 'Crisp masala dosa, soft idli, medu vada, ven pongal, coconut chutney, and strong filter coffee, served as all-day tiffin favorites.',
      imageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&auto=format&fit=crop&q=80',
      owner: owner1._id,
    });

    const rest2 = await Restaurant.create({
      name: 'Udupi Tiffin Kitchen',
      cuisine: 'South Indian',
      location: 'Udupi',
      openingHours: '12:00 PM - 10:00 PM',
      description: 'Udupi-style masala dosa, neer dosa, fluffy idli, sambar, coconut chutneys, and sweet South Indian filter coffee.',
      imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop&q=80',
      owner: owner2._id,
    });

    const rest3 = await Restaurant.create({
      name: 'Chettinad Banana Leaf',
      cuisine: 'South Indian',
      location: 'Madurai',
      openingHours: '11:00 AM - 11:00 PM',
      description: 'A South Indian banana-leaf spread with tamarind rice, lemon rice, sambar, rasam, vegetable poriyal, and Chettinad specialties.',
      imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
      owner: owner3._id,
    });

    const rest4 = await Restaurant.create({
      name: 'Coastal Malabar Kitchen',
      cuisine: 'South Indian',
      location: 'Kochi',
      openingHours: '12:00 PM - 12:00 AM',
      description: 'Kerala appam with stew, puttu and kadala curry, idiyappam, and fragrant coconut-rich vegetable dishes.',
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
      owner: null, // Unassigned for admin testing
    });

    const rest5 = await Restaurant.create({
      name: 'Pongal & Filter Coffee',
      cuisine: 'South Indian',
      location: 'Coimbatore',
      openingHours: '5:00 PM - 11:00 PM',
      description: 'Comforting ven pongal, crispy rava dosa, idli, medu vada, fresh sambar, and traditional filter coffee.',
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80',
      owner: null, // Unassigned for admin testing
    });

    await Restaurant.create([
      {
        name: 'Madras Tiffin House',
        cuisine: 'South Indian',
        location: 'Chennai',
        description: 'A breakfast favorite for ghee podi dosa, soft idli, medu vada, ven pongal, coconut chutney, and strong filter coffee.',
        imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
        owner: null,
      },
      {
        name: 'Bengaluru Dosa Room',
        cuisine: 'South Indian',
        location: 'Bengaluru',
        description: 'Try benne dosa, paper and rava dosa, set dosa, bisi bele bath, vada sambar, and freshly brewed filter coffee.',
        imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80',
        owner: null,
      },
      {
        name: 'Malabar Steam & Spice',
        cuisine: 'South Indian',
        location: 'Kochi',
        description: 'Kerala-style appam with stew, puttu and kadala curry, idiyappam, and fragrant coconut-rich vegetable dishes.',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
        owner: null,
      },
    ]);

    console.log('[Seed] Creating Reviews with distribution...');
    // Chennai Dosa House (Average: ~4.5)
    await Review.create([
      { customer: customer1._id, restaurant: rest1._id, rating: 5, comment: 'Crisp masala dosa with delicious coconut chutney and sambar.' },
      { customer: customer2._id, restaurant: rest1._id, rating: 5, comment: 'Soft idli and medu vada made a lovely breakfast with filter coffee.' },
      { customer: customer3._id, restaurant: rest1._id, rating: 4, comment: 'The ven pongal was comforting and the portions were generous.' },
      { customer: customer4._id, restaurant: rest1._id, rating: 4, comment: 'Great dosa and friendly service. The chutneys were especially good.' },
    ]);

    // Udupi Tiffin Kitchen (Average: ~4.7)
    await Review.create([
      { customer: customer1._id, restaurant: rest2._id, rating: 5, comment: 'The masala dosa was golden and crisp with a flavorful potato filling.' },
      { customer: customer2._id, restaurant: rest2._id, rating: 5, comment: 'Neer dosa with coconut chutney was light, fresh, and delicious.' },
      { customer: customer3._id, restaurant: rest2._id, rating: 4, comment: 'Excellent sambar and filter coffee. I would happily come back.' },
    ]);

    // Chettinad Banana Leaf (Average: ~4.3)
    await Review.create([
      { customer: customer1._id, restaurant: rest3._id, rating: 4, comment: 'A satisfying banana-leaf meal with fragrant rice, sambar, and poriyal.' },
      { customer: customer2._id, restaurant: rest3._id, rating: 5, comment: 'Loved the tangy tamarind rice and the variety of vegetable sides.' },
      { customer: customer3._id, restaurant: rest3._id, rating: 3, comment: 'Tasty rasam and rice, though service was a little slow at lunch.' },
      { customer: customer4._id, restaurant: rest3._id, rating: 5, comment: 'Wonderful vegetarian meal with fresh chutneys and crisp papad.' },
    ]);

    // Coastal Malabar Kitchen (Average: ~3.7)
    await Review.create([
      { customer: customer1._id, restaurant: rest4._id, rating: 4, comment: 'Appam with vegetable stew was comforting and full of coconut flavor.' },
      { customer: customer2._id, restaurant: rest4._id, rating: 3, comment: 'The puttu and kadala curry were good, but the wait was a bit long.' },
      { customer: customer3._id, restaurant: rest4._id, rating: 5, comment: 'Delicious idiyappam and stew. Everything tasted fresh.' },
      { customer: customer4._id, restaurant: rest4._id, rating: 2, comment: 'The appam was nice, but the sides could use more seasoning.' },
    ]);

    // Note: Pongal & Filter Coffee is left without reviews to show the unrated state.

    console.log('[Seed] Database seeding completed successfully!');
    console.log('======================================================');
    console.log('Sample Logins:');
    console.log('  Admin:            admin@platform.com / Admin@1234');
    console.log('  Owner (Chennai):  owner.mario@platform.com / Owner@1234');
    console.log('  Owner (Udupi):    owner.sakura@platform.com / Owner@1234');
    console.log('  Owner (Madurai):  owner.priya@platform.com / Owner@1234');
    console.log('  Customer 1:       customer.alex@example.com / Customer@1234');
    console.log('  Customer 2:       customer.sarah@example.com / Customer@1234');
    console.log('======================================================');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    throw err;
  }
};

// If run directly via node seed.js
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}
