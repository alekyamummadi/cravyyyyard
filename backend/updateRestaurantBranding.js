import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './config/db.js';
import Restaurant from './models/Restaurant.js';

dotenv.config();

const restaurantUpdates = [
  {
    oldNames: ['Trattoria Bella', 'Olive & Ember'],
    name: 'Chennai Dosa House',
    cuisine: 'South Indian',
    location: 'Chennai',
    description: 'Crisp masala dosa, soft idli, medu vada, ven pongal, coconut chutney, and strong filter coffee, served as all-day tiffin favorites.',
    imageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&auto=format&fit=crop&q=80',
  },
  {
    oldNames: ['Sakura Bistro', 'Kumo Ramen House'],
    name: 'Udupi Tiffin Kitchen',
    cuisine: 'South Indian',
    location: 'Udupi',
    description: 'Udupi-style masala dosa, neer dosa, fluffy idli, sambar, coconut chutneys, and sweet South Indian filter coffee.',
    imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop&q=80',
  },
  {
    oldNames: ['Spice Symphony', 'Saffron & Spice'],
    name: 'Chettinad Banana Leaf',
    cuisine: 'South Indian',
    location: 'Madurai',
    description: 'A South Indian banana-leaf spread with tamarind rice, lemon rice, sambar, rasam, vegetable poriyal, and Chettinad specialties.',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
  },
  {
    oldNames: ['El Fuego Cantina', 'Casa Sol Taqueria'],
    name: 'Coastal Malabar Kitchen',
    cuisine: 'South Indian',
    location: 'Kochi',
    description: 'Kerala appam with stew, puttu and kadala curry, idiyappam, and fragrant coconut-rich vegetable dishes.',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
  },
  {
    oldNames: ['Le Bistro Parisien', 'Maison Clement'],
    name: 'Pongal & Filter Coffee',
    cuisine: 'South Indian',
    location: 'Coimbatore',
    description: 'Comforting ven pongal, crispy rava dosa, idli, medu vada, fresh sambar, and traditional filter coffee.',
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80',
  },
];

const southIndianRestaurants = [
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
];

const updateRestaurants = async () => {
  await connectDB();

  try {
    for (const update of restaurantUpdates) {
      const oldRestaurants = await Restaurant.find({ name: { $in: update.oldNames } });
      const renamedRestaurant = await Restaurant.findOne({ name: update.name });

      if (oldRestaurants.length > 1) {
        throw new Error(`Multiple old records found for "${update.name}". Resolve the duplicates before updating.`);
      }

      const oldRestaurant = oldRestaurants[0];
      if (oldRestaurant && renamedRestaurant && !oldRestaurant._id.equals(renamedRestaurant._id)) {
        throw new Error(`Cannot rename "${oldRestaurant.name}": "${update.name}" already exists.`);
      }

      const restaurant = oldRestaurant || renamedRestaurant;
      if (!restaurant) {
        console.warn(`[Branding] Skipped "${update.oldNames.join('" or "')}" because no matching record was found.`);
        continue;
      }

      Object.assign(restaurant, {
        name: update.name,
        cuisine: update.cuisine,
        location: update.location,
        address: '',
        phone: '',
        description: update.description,
        imageUrl: update.imageUrl,
      });
      await restaurant.save();
      console.log(`[Branding] Updated "${restaurant.name}".`);
    }

    for (const data of southIndianRestaurants) {
      const restaurant = await Restaurant.findOne({ name: data.name });
      if (restaurant) {
        restaurant.cuisine = data.cuisine;
        restaurant.location = data.location;
        restaurant.imageUrl = data.imageUrl;
        restaurant.description = data.description;
        restaurant.address = '';
        restaurant.phone = '';
        await restaurant.save();
        console.log(`[Branding] Updated "${data.name}".`);
      } else {
        await Restaurant.create(data);
        console.log(`[Branding] Added "${data.name}".`);
      }
    }
  } finally {
    await disconnectDB();
  }
};

updateRestaurants().catch((err) => {
  console.error('[Branding] Restaurant update failed:', err.message);
  process.exitCode = 1;
});
