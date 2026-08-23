import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import {Category} from '../models/Category';
import {Product} from '../models/Product';
import User from '../models/User';

dotenv.config();

// ─── 1. Categories ──────────────────────────────────────────────────
const categories = [
  {
    name: 'Pastries & Pies',
    slug: 'pastries',
    description: 'Golden, buttery Nigerian meat pies, chicken pies, sausage rolls, and egg rolls.',
    image: 'https://images.unsplash.com/photo-1725517561537-defd6a13b174?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Small Chops',
    slug: 'fried-snacks',
    description: 'Crispy fried Nigerian party snacks, golden puff-puff, spring rolls, and samosas.',
    image: 'https://plus.unsplash.com/premium_photo-1673808894439-562c6e86fd93?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Suya & Grills',
    slug: 'protein-snacks',
    description: 'Charcoal-grilled prime beef suya, peppered asun, kilishi, and spiced gizzard skewers.',
    image: 'https://images.unsplash.com/photo-1558030137-a56c1b004fa3?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sweet Treats',
    slug: 'sweet-snacks',
    description: 'Nutmeg chin chin, chewy coconut candy, and traditional shuku-shuku treats.',
    image: 'https://images.unsplash.com/photo-1783286943710-b6f73d28c821?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Chips & Crisps',
    slug: 'chips',
    description: 'Sweet and savory plantain chips, roasted cashew nuts, and crispy kokoro.',
    image: 'https://plus.unsplash.com/premium_photo-1683657314802-ee45488eb870?w=800&auto=format&fit=crop&q=80',
  },
];

// ─── 2. Nigerian Snacks Catalog ─────────────────────────────────────
const products = [
  // ── Pastries & Pies ──
  {
    name: 'Classic Nigerian Meat Pie',
    description: 'Flaky shortcrust pastry generously filled with seasoned minced beef, soft cubed potatoes, and carrots flavored with curry and thyme.',
    price: 1200,
    originalPrice: 1500,
    image: 'https://images.unsplash.com/photo-1624128082323-beb6b8b508db?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1624128082323-beb6b8b508db?w=800&auto=format&fit=crop&q=80'],
    category: 'pastries',
    rating: 4.9,
    reviewCount: 240,
    ingredients: ['Prime Minced Beef', 'Flour', 'Butter', 'Irish Potatoes', 'Carrots', 'Nutmeg', 'Nigerian Curry', 'Thyme'],
    allergens: ['Gluten', 'Dairy'],
    stock: 45,
    featured: true,
    popular: true,
  },
  {
    name: 'Spicy Shredded Chicken Pie',
    description: 'Tender chicken breast braised in scotch bonnet peppers, carrots, and sweet corn inside a buttery golden pastry pocket.',
    price: 1400,
    originalPrice: 1700,
    image: 'https://images.unsplash.com/photo-1650917331384-1fd06afa3230?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1778449760081-933b1cfd414c?w=800&auto=format&fit=crop&q=80'],
    category: 'pastries',
    rating: 4.8,
    reviewCount: 168,
    ingredients: ['Chicken Breast', 'Flour', 'Butter', 'Sweet Corn', 'Carrots', 'Scotch Bonnet', 'Spring Onions'],
    allergens: ['Gluten', 'Dairy'],
    stock: 30,
    featured: false,
    popular: true,
  },
  {
    name: 'Savory Beef Sausage Roll',
    description: 'Spiced minced beef sausage meat infused with black pepper and herbs, wrapped inside golden puff pastry layers.',
    price: 900,
    originalPrice: 1200,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYgVpmeqnWCnDAQmbW41rjUQF4nLSN7i0VD3PWjpntvQ&s=10',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYgVpmeqnWCnDAQmbW41rjUQF4nLSN7i0VD3PWjpntvQ&s=10'],
    category: 'pastries',
    rating: 4.6,
    reviewCount: 115,
    ingredients: ['Minced Beef Sausage', 'Flour', 'Butter', 'Sage', 'Nutmeg', 'Egg Wash'],
    allergens: ['Gluten', 'Eggs'],
    stock: 55,
    featured: false,
    popular: true,
  },
  {
    name: 'Street-Style Nigerian Egg Roll',
    description: 'A whole farm-fresh boiled egg encased in a dense, sweet, nutmeg-spiced dough and fried to a deep golden crust.',
    price: 600,
    originalPrice: 800,
    image: 'https://images.unsplash.com/photo-1633945488479-ec6b9776be54?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1633945488479-ec6b9776be54?w=800&auto=format&fit=crop&q=80'],
    category: 'pastries',
    rating: 4.7,
    reviewCount: 194,
    ingredients: ['Boiled Egg', 'Wheat Flour', 'Nutmeg', 'Sugar', 'Vegetable Oil'],
    allergens: ['Gluten', 'Eggs'],
    stock: 40,
    featured: true,
    popular: true,
  },
  {
    name: 'Spicy Peppered Fish Roll',
    description: 'Flaked smoked mackerel slow-simmered in a habanero and onion reduction, rolled in a crispy fried pastry.',
    price: 1000,
    originalPrice: 1300,
    image: 'https://i.ytimg.com/vi/OFuN4uAlJc8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDn6LTLXn3-l9QJ3kEjLd61LOh3VA',
    images: ['https://i.ytimg.com/vi/OFuN4uAlJc8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDn6LTLXn3-l9QJ3kEjLd61LOh3VA'],
    category: 'pastries',
    rating: 4.7,
    reviewCount: 88,
    ingredients: ['Smoked Mackerel', 'Flour', 'Habanero Peppers', 'Red Onions', 'Vegetable Oil'],
    allergens: ['Gluten', 'Fish'],
    stock: 25,
    featured: false,
    popular: false,
  },
  {
    name: 'Nigerian Scotch Egg (2 pcs)',
    description: 'Hard-boiled egg wrapped in seasoned minced sausage meat, dredged in crispy breadcrumbs, and deep-fried to perfection.',
    price: 1300,
    originalPrice: 1600,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80'],
    category: 'pastries',
    rating: 4.8,
    reviewCount: 112,
    ingredients: ['Boiled Eggs', 'Seasoned Minced Sausage', 'Breadcrumbs', 'Flour', 'Egg Wash'],
    allergens: ['Gluten', 'Eggs'],
    stock: 35,
    featured: false,
    popular: true,
  },
  {
    name: 'Mini Cocktail Meat Pies Pack (6 pcs)',
    description: 'Bite-sized flaky meat pies perfect for parties — same classic filling in a party-ready size.',
    price: 2800,
    originalPrice: 3500,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7r_Hu68zmtVGOanVqDdcjypPQ5juCSjfwLwEG8LAQNKZHJ9DCkv6luA0G&s=10',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7r_Hu68zmtVGOanVqDdcjypPQ5juCSjfwLwEG8LAQNKZHJ9DCkv6luA0G&s=10'],
    category: 'pastries',
    rating: 4.8,
    reviewCount: 156,
    ingredients: ['Minced Beef', 'Flour', 'Butter', 'Potatoes', 'Carrots', 'Curry'],
    allergens: ['Gluten', 'Dairy'],
    stock: 28,
    featured: true,
    popular: true,
  },
  {
    name: 'Vegetable Spring Roll Pie',
    description: 'Buttery pastry pocket stuffed with cabbage, carrots, green beans, and mild curry spices.',
    price: 950,
    originalPrice: 1200,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80'],
    category: 'pastries',
    rating: 4.5,
    reviewCount: 72,
    ingredients: ['Flour', 'Butter', 'Cabbage', 'Carrots', 'Green Beans', 'Curry Powder'],
    allergens: ['Gluten', 'Dairy'],
    stock: 40,
    featured: false,
    popular: false,
  },
  {
    name: 'Cornish-Style Nigerian Pastel',
    description: 'Hand-crimped pastry half-moons filled with spicy beef, potatoes, and scotch bonnet.',
    price: 1100,
    originalPrice: 1400,
    image: 'https://www.yourhomebasedmom.com/wp-content/uploads/2021/05/cornish-pastry-8-of-19.jpg',
    images: ['https://www.yourhomebasedmom.com/wp-content/uploads/2021/05/cornish-pastry-8-of-19.jpg'],
    category: 'pastries',
    rating: 4.6,
    reviewCount: 98,
    ingredients: ['Minced Beef', 'Flour', 'Butter', 'Potatoes', 'Scotch Bonnet', 'Onions'],
    allergens: ['Gluten', 'Dairy'],
    stock: 32,
    featured: false,
    popular: true,
  },

  // ── Small Chops ──
  {
    name: 'Puff-Puff (10 pcs Box)',
    description: 'Soft, fluffy, pillowy spheres of sweet yeast dough deep-fried until gloriously golden with a hint of warm nutmeg.',
    price: 1500,
    originalPrice: 1800,
    image: 'https://images.unsplash.com/photo-1641848462617-3fa96cb718e2?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1641848462617-3fa96cb718e2?w=800&auto=format&fit=crop&q=80'],
    category: 'fried-snacks',
    rating: 4.9,
    reviewCount: 512,
    ingredients: ['Flour', 'Sugar', 'Yeast', 'Nutmeg', 'Vegetable Oil'],
    allergens: ['Gluten'],
    stock: 80,
    featured: true,
    popular: true,
  },
  {
    name: 'Peppered Onion Puff-Puff (10 pcs)',
    description: 'Our classic sweet puff-puff batter elevated with finely minced red scotch bonnet peppers and sweet spring onions.',
    price: 1700,
    originalPrice: 2000,
    image: 'https://plus.unsplash.com/premium_photo-1668618295098-db2abd0f440a?w=800&auto=format&fit=crop&q=80',
    images: ['https://plus.unsplash.com/premium_photo-1668618295098-db2abd0f440a?w=800&auto=format&fit=crop&q=80'],
    category: 'fried-snacks',
    rating: 4.8,
    reviewCount: 198,
    ingredients: ['Flour', 'Scotch Bonnet', 'Spring Onions', 'Sugar', 'Yeast', 'Nutmeg'],
    allergens: ['Gluten'],
    stock: 50,
    featured: false,
    popular: true,
  },
  {
    name: 'Party Samosas & Spring Rolls Platter',
    description: 'A 10-piece snack box combo of crisp minced beef samosas and crunchy vegetable spring rolls served with spicy dip.',
    price: 3200,
    originalPrice: 4200,
    image: 'https://savouryboutique.com/cdn/shop/products/SamoosandSpringrollnb2.png?v=1612355275',
    images: ['https://savouryboutique.com/cdn/shop/products/SamoosandSpringrollnb2.png?v=1612355275'],
    category: 'fried-snacks',
    rating: 4.8,
    reviewCount: 285,
    ingredients: ['Minced Beef', 'Filo Pastry', 'Cabbage', 'Carrots', 'Chili', 'Curry Seasoning'],
    allergens: ['Gluten', 'Soy'],
    stock: 35,
    featured: true,
    popular: true,
  },
  {
    name: 'Crispy Akara Balls (Bean Cakes - 8 pcs)',
    description: 'Lightly whipped black-eyed pea fritters seasoned with fresh peppers and onions, fried to a golden crunch with a fluffy interior.',
    price: 1400,
    originalPrice: 1700,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7IhI-FypkvJYwfFHhRb7rnm_0XXbR_9IhBWWqpkyfNPUqr9upC27RSVxz&s=10',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7IhI-FypkvJYwfFHhRb7rnm_0XXbR_9IhBWWqpkyfNPUqr9upC27RSVxz&s=10'],
    category: 'fried-snacks',
    rating: 4.7,
    reviewCount: 174,
    ingredients: ['Black-Eyed Peas', 'Tatashe Bell Peppers', 'Habanero', 'Onions', 'Vegetable Oil'],
    allergens: [],
    stock: 40,
    featured: true,
    popular: true,
  },
  {
    name: 'Roasted Boli & Groundnuts Combo',
    description: 'Smoky, charred ripe yellow plantains roasted over open coals, served with a side of crunchy oven-roasted peanuts.',
    price: 1800,
    originalPrice: 2200,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNTNLFfIUlE7u8PoQOfJD-NrYfzwaxWDO7UQY10iE6NVEzaqeut2Qy2vY&s=10',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNTNLFfIUlE7u8PoQOfJD-NrYfzwaxWDO7UQY10iE6NVEzaqeut2Qy2vY&s=10'],
    category: 'fried-snacks',
    rating: 4.8,
    reviewCount: 198,
    ingredients: ['Ripe Yellow Plantains', 'Roasted Peanuts (Groundnuts)'],
    allergens: ['Peanuts'],
    stock: 35,
    featured: false,
    popular: true,
  },
  {
    name: 'Peppered Gizzard Skewers (6 pcs)',
    description: 'Chewy chicken gizzards marinated and fried, tossed in spicy pepper sauce on sticks.',
    price: 2200,
    originalPrice: 2800,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJfO1z_HYP1FJUXPT45qDIX55ZuC0YDj_jnFL31N_iVngJQvde5beEn7tV&s=10',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJfO1z_HYP1FJUXPT45qDIX55ZuC0YDj_jnFL31N_iVngJQvde5beEn7tV&s=10'],
    category: 'fried-snacks',
    rating: 4.7,
    reviewCount: 142,
    ingredients: ['Chicken Gizzards', 'Scotch Bonnet', 'Onions', 'Bell Peppers', 'Vegetable Oil'],
    allergens: [],
    stock: 28,
    featured: false,
    popular: true,
  },
  {
    name: 'Crispy Chicken Wings Small Chops (8 pcs)',
    description: 'Crispy fried chicken wings tossed in mild pepper sauce — Lagos party classic.',
    price: 3500,
    originalPrice: 4200,
    image: 'https://coopcancook.com/wp-content/uploads/2021/03/Photo-Dec-28-9-12-33-AM.jpg',
    images: ['https://coopcancook.com/wp-content/uploads/2021/03/Photo-Dec-28-9-12-33-AM.jpg'],
    category: 'fried-snacks',
    rating: 4.8,
    reviewCount: 210,
    ingredients: ['Chicken Wings', 'Flour', 'Pepper Sauce', 'Garlic', 'Vegetable Oil'],
    allergens: ['Gluten'],
    stock: 30,
    featured: true,
    popular: true,
  },
  {
    name: 'Mini Puff-Puff Party Box (25 pcs)',
    description: 'Party-size box of golden puff-puff — soft, sweet, and ready for sharing.',
    price: 2800,
    originalPrice: 3500,
    image: 'https://images.unsplash.com/photo-1762160964307-3711080c33e1?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1762160964307-3711080c33e1?w=800&auto=format&fit=crop&q=80'],
    category: 'fried-snacks',
    rating: 4.9,
    reviewCount: 320,
    ingredients: ['Flour', 'Sugar', 'Yeast', 'Nutmeg', 'Vegetable Oil'],
    allergens: ['Gluten'],
    stock: 45,
    featured: false,
    popular: true,
  },
  {
    name: 'Spicy Beef Samosas (8 pcs Pack)',
    description: 'Crispy triangular pastries stuffed with spiced minced beef, peas, and chili.',
    price: 2000,
    originalPrice: 2600,
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80'],
    category: 'fried-snacks',
    rating: 4.7,
    reviewCount: 165,
    ingredients: ['Minced Beef', 'Samosa Pastry', 'Peas', 'Chili', 'Cumin', 'Coriander'],
    allergens: ['Gluten'],
    stock: 38,
    featured: false,
    popular: true,
  },

  // ── Suya & Grills ──
  {
    name: 'Prime Beef Suya Skewers (5 Sticks)',
    description: 'Thinly cut prime beef sirloin rubbed with fiery Northern Yaji (Kuli-Kuli peanut) spice and charred over glowing coals.',
    price: 3500,
    originalPrice: 4200,
    image: 'https://plus.unsplash.com/premium_photo-1661310177352-f586bf23a403?w=800&auto=format&fit=crop&q=80',
    images: ['https://plus.unsplash.com/premium_photo-1661310177352-f586bf23a403?w=800&auto=format&fit=crop&q=80'],
    category: 'protein-snacks',
    rating: 5.0,
    reviewCount: 680,
    ingredients: ['Prime Beef Sirloin', 'Northern Yaji Spice', 'Groundnut Oil', 'Sliced Red Onions', 'Cucumbers'],
    allergens: ['Peanuts'],
    stock: 30,
    featured: true,
    popular: true,
  },
  {
    name: 'Peppered Asun Bites (Smoked Goat Meat)',
    description: 'Bite-sized roasted goat meat infused with rich woodsmoke, tossed in a blazing scotch bonnet and sweet onion reduction.',
    price: 4200,
    originalPrice: 5000,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4LQgL3MHqZsF5g5Kq64aSk5uKQpoAKZBlz2Bhelv6289o66cxGkoFvAp1&s=80',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4LQgL3MHqZsF5g5Kq64aSk5uKQpoAKZBlz2Bhelv6289o66cxGkoFvAp1&s=80'],
    category: 'protein-snacks',
    rating: 4.9,
    reviewCount: 390,
    ingredients: ['Smoked Goat Meat', 'Scotch Bonnet (Rodo)', 'Bell Peppers', 'Red Onions', 'Vegetable Oil'],
    allergens: [],
    stock: 20,
    featured: true,
    popular: true,
  },
  {
    name: 'Boneless Chicken Suya Strips',
    description: 'Juicy skewered chicken breast cubes coated in dry Kuli-Kuli peanut spice and slow-grilled over charcoal embers.',
    price: 3200,
    originalPrice: 3800,
    image: 'https://lowcarbafrica.com/wp-content/uploads/2024/07/Chicken-Suya-3.jpg',
    images: ['https://lowcarbafrica.com/wp-content/uploads/2024/07/Chicken-Suya-3.jpg'],
    category: 'protein-snacks',
    rating: 4.8,
    reviewCount: 154,
    ingredients: ['Chicken Breast', 'Yaji Spice', 'Groundnut Oil', 'Red Onions', 'Tomatoes'],
    allergens: ['Peanuts'],
    stock: 35,
    featured: false,
    popular: true,
  },
  {
    name: 'Sweet-Heat Gizdodo Snack Skewers',
    description: 'Toothpick skewers of sweet caramelized plantain cubes (Dodo) paired with chewy gizzard chunks in spicy pepper sauce.',
    price: 2800,
    originalPrice: 3400,
    image: 'https://plus.unsplash.com/premium_photo-1695045521108-e19e991eb599?w=800&auto=format&fit=crop&q=80',
    images: ['https://plus.unsplash.com/premium_photo-1695045521108-e19e991eb599?w=800&auto=format&fit=crop&q=80'],
    category: 'protein-snacks',
    rating: 4.8,
    reviewCount: 210,
    ingredients: ['Chicken Gizzards', 'Ripe Plantain', 'Red Bell Peppers', 'Onions', 'Habanero Sauce'],
    allergens: [],
    stock: 30,
    featured: true,
    popular: true,
  },
  {
    name: 'Northern Beef Kilishi (100g Pack)',
    description: 'Gourmet paper-thin sun-dried beef strips soaked in crushed peanuts, red pepper, and ginger. A smoky, chewable highway classic.',
    price: 2600,
    originalPrice: 3500,
    image: 'https://images.unsplash.com/photo-1671088672987-65a7848e1c76?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1671088672987-65a7848e1c76?w=800&auto=format&fit=crop&q=80'],
    category: 'protein-snacks',
    rating: 4.9,
    reviewCount: 265,
    ingredients: ['Dehydrated Lean Beef', 'Groundnut Paste', 'Yaji Seasoning', 'Ginger', 'Chili'],
    allergens: ['Peanuts'],
    stock: 50,
    featured: true,
    popular: true,
  },
  {
    name: 'Spicy Peppered Snail Skewers (3 Sticks)',
    description: 'Giant African land snails steamed, sliced, and slow-braised in a fiery scotch bonnet and sweet bell pepper glaze.',
    price: 5200,
    originalPrice: 6500,
    image: 'https://images.unsplash.com/photo-1665111915476-b91b328a3c37?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    images: ['https://images.unsplash.com/photo-1665111915476-b91b328a3c37?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
    category: 'protein-snacks',
    rating: 4.9,
    reviewCount: 92,
    ingredients: ['African Giant Land Snails', 'Scotch Bonnet', 'Red Bell Peppers', 'Onions', 'Garlic'],
    allergens: ['Molluscs'],
    stock: 15,
    featured: false,
    popular: true,
  },
  {
    name: 'Family Suya Platter (10 Sticks)',
    description: 'Shareable platter of prime beef suya with extra yaji, onions, tomatoes, and cucumber.',
    price: 6000,
    originalPrice: 8500,
    image: 'https://plus.unsplash.com/premium_photo-1723478557023-1f739ec06671?w=800&auto=format&fit=crop&q=80',
    images: ['https://plus.unsplash.com/premium_photo-1723478557023-1f739ec06671?w=800&auto=format&fit=crop&q=80'],
    category: 'protein-snacks',
    rating: 5.0,
    reviewCount: 420,
    ingredients: ['Prime Beef', 'Yaji Spice', 'Groundnut Oil', 'Red Onions', 'Tomatoes', 'Cucumber'],
    allergens: ['Peanuts'],
    stock: 18,
    featured: true,
    popular: true,
  },

  // ── Chips & Crisps ──
  {
    name: 'Sweet Ripe Plantain Chips (Large Tub)',
    description: 'Thinly sliced ripe plantains fried to a golden caramel crunch with zero artificial additives or preservatives.',
    price: 1500,
    originalPrice: 1800,
    image: 'https://plus.unsplash.com/premium_photo-1714247230381-3e0aff1d66b2?w=800&auto=format&fit=crop&q=80',
    images: ['https://plus.unsplash.com/premium_photo-1714247230381-3e0aff1d66b2?w=800&auto=format&fit=crop&q=80'],
    category: 'chips',
    rating: 4.9,
    reviewCount: 380,
    ingredients: ['Ripe Yellow Plantains', 'Vegetable Oil', 'Sea Salt'],
    allergens: [],
    stock: 80,
    featured: true,
    popular: true,
  },
  {
    name: 'Salted Unripe Plantain Strips',
    description: 'Paper-thin, ultra-crispy savory green plantain ribbons seasoned with a dash of fine sea salt and white pepper.',
    price: 1200,
    originalPrice: 1500,
    image: 'https://images.unsplash.com/photo-1775377262418-24c4d1c89574?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1775377262418-24c4d1c89574?w=800&auto=format&fit=crop&q=80'],
    category: 'chips',
    rating: 4.7,
    reviewCount: 215,
    ingredients: ['Unripe Green Plantains', 'Vegetable Oil', 'Sea Salt', 'White Pepper'],
    allergens: [],
    stock: 65,
    featured: false,
    popular: true,
  },
  {
    name: 'Roasted Ogbomosho Cashew Nuts (300g)',
    description: 'Handpicked whole jumbo cashew nuts roasted in small batches with fine sea salt for a rich, buttery crunch.',
    price: 3500,
    originalPrice: 4200,
    image: 'https://plus.unsplash.com/premium_photo-1726768985970-dde12087d972?w=800&auto=format&fit=crop&q=80',
    images: ['https://plus.unsplash.com/premium_photo-1726768985970-dde12087d972?w=800&auto=format&fit=crop&q=80'],
    category: 'chips',
    rating: 4.9,
    reviewCount: 290,
    ingredients: ['Jumbo Cashew Nuts', 'Fine Sea Salt'],
    allergens: ['Tree Nuts (Cashews)'],
    stock: 45,
    featured: true,
    popular: true,
  },
  {
    name: 'Spicy Crunchy Kokoro Sticks',
    description: 'Crisp Western-style Nigerian cornmeal snack rings seasoned with dry ginger powder, sugar, and chili flakes.',
    price: 1100,
    originalPrice: 1400,
    image: 'https://tarasmulticulturaltable.com/wp-content/uploads/2025/05/Kokoro-Crunchy-Corn-Sticks-10-of-10-500x375.jpg',
    images: ['https://tarasmulticulturaltable.com/wp-content/uploads/2025/05/Kokoro-Crunchy-Corn-Sticks-10-of-10-500x375.jpg'],
    category: 'chips',
    rating: 4.5,
    reviewCount: 94,
    ingredients: ['White Cornmeal', 'Sugar', 'Chili Flakes', 'Ginger Powder', 'Vegetable Oil'],
    allergens: ['Corn'],
    stock: 50,
    featured: false,
    popular: true,
  },
  {
    name: 'Northern Kuli-Kuli Crunchy Rounds',
    description: 'Savory defatted peanut paste biscuits seasoned with ginger and cayenne pepper, fried hard for an authentic crunch.',
    price: 1300,
    originalPrice: 1600,
    image: 'https://greenbaskit.com/wp-content/uploads/2020/02/ee-scaled-1.webp',
    images: ['https://greenbaskit.com/wp-content/uploads/2020/02/ee-scaled-1.webp'],
    category: 'chips',
    rating: 4.6,
    reviewCount: 140,
    ingredients: ['Defatted Peanuts', 'Ginger', 'Chili Powder', 'Salt'],
    allergens: ['Peanuts'],
    stock: 50,
    featured: false,
    popular: true,
  },
  {
    name: 'Crispy Salted Yam Chips (Dundun Tub)',
    description: 'Golden-fried thin yam batons seasoned with sea salt and served with our signature pepper dipping sauce.',
    price: 1600,
    originalPrice: 2000,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmg-cUT_fYjHO9uSJ6Qy4kmLIqnVxYg3xoI6jnZkxN_8XrOZL6luh7tiFg&s=10',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmg-cUT_fYjHO9uSJ6Qy4kmLIqnVxYg3xoI6jnZkxN_8XrOZL6luh7tiFg&s=10'],
    category: 'chips',
    rating: 4.7,
    reviewCount: 110,
    ingredients: ['White Yam', 'Vegetable Oil', 'Sea Salt', 'Pepper Dip'],
    allergens: [],
    stock: 35,
    featured: false,
    popular: true,
  },
  {
    name: 'Spicy Plantain Chips (Pepper Dust Tub)',
    description: 'Sweet plantain chips dusted with dry pepper seasoning for a sweet-heat crunch.',
    price: 1400,
    originalPrice: 1700,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJmFfZSFlY-AptrmsDArPF65hG6H1YR1yw_2svSVcR8vEwic21bMRgYYWS&s=80',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJmFfZSFlY-AptrmsDArPF65hG6H1YR1yw_2svSVcR8vEwic21bMRgYYWS&s=80'],
    category: 'chips',
    rating: 4.8,
    reviewCount: 188,
    ingredients: ['Ripe Plantain', 'Pepper Seasoning', 'Sea Salt', 'Vegetable Oil'],
    allergens: [],
    stock: 55,
    featured: true,
    popular: true,
  },

  // ── Sweet Treats ──
  {
    name: 'Buttery Nutmeg Chin Chin (1kg Tub)',
    description: 'Crisp, golden-brown snack cubes made with real evaporated milk, vanilla, and ground aromatic nutmeg. Stays crunchy for weeks.',
    price: 3200,
    originalPrice: 3800,
    image: 'https://images.unsplash.com/photo-1665554837563-3782d21a676b?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1665554837563-3782d21a676b?w=800&auto=format&fit=crop&q=80'],
    category: 'sweet-snacks',
    rating: 5.0,
    reviewCount: 620,
    ingredients: ['Flour', 'Evaporated Milk', 'Pure Butter', 'Nutmeg', 'Vanilla Extract', 'Sugar'],
    allergens: ['Gluten', 'Dairy'],
    stock: 70,
    featured: true,
    popular: true,
  },
  {
    name: 'Caramelized Coconut Candy',
    description: 'Fresh shredded coconut ribbons slow-simmered in caramelized cane sugar until crunchy, chewy, and richly browned.',
    price: 1600,
    originalPrice: 2000,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFKqGQC_f17ZBzii7Fe471v1ID2YsVgw9FySaLLXl4lhTJ4f99DHhjfr0y&s=10',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFKqGQC_f17ZBzii7Fe471v1ID2YsVgw9FySaLLXl4lhTJ4f99DHhjfr0y&s=10'],
    category: 'sweet-snacks',
    rating: 4.8,
    reviewCount: 195,
    ingredients: ['Fresh Coconut Flesh', 'Caramelized Cane Sugar', 'Water'],
    allergens: [],
    stock: 45,
    featured: true,
    popular: true,
  },
  {
    name: 'Shuku-Shuku Coconut Balls (12 pcs)',
    description: 'Chewy, fragrant toasted coconut flakes bound with sweetened condensed milk and baked to a golden glaze.',
    price: 2200,
    originalPrice: 2700,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVTxgUbzjq87B4CRHP6hs1_LclCN-Iaa4_iKXfdWw8KicK-0czOeIZSTM&s=10',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVTxgUbzjq87B4CRHP6hs1_LclCN-Iaa4_iKXfdWw8KicK-0czOeIZSTM&s=10'],
    category: 'sweet-snacks',
    rating: 4.7,
    reviewCount: 135,
    ingredients: ['Desiccated Coconut', 'Condensed Milk', 'Egg Yolk', 'Nutmeg'],
    allergens: ['Dairy', 'Eggs'],
    stock: 30,
    featured: false,
    popular: true,
  },
  {
    name: 'Sweet Plantain Mosa Drops (10 pcs)',
    description: 'Overripe plantain purée blended into a sweet yeast batter, fried to pillowy sweet balls, and dusted with cinnamon sugar.',
    price: 1800,
    originalPrice: 2200,
    image: 'https://theonlinecook.com/wp-content/uploads/2022/03/plantain-mosa-or-plantain-puff-puff.png',
    images: ['https://theonlinecook.com/wp-content/uploads/2022/03/plantain-mosa-or-plantain-puff-puff.png'],
    category: 'sweet-snacks',
    rating: 4.7,
    reviewCount: 120,
    ingredients: ['Overripe Plantains', 'Flour', 'Yeast', 'Cinnamon', 'Sugar'],
    allergens: ['Gluten'],
    stock: 35,
    featured: true,
    popular: true,
  },
  {
    name: 'Chin Chin Party Box (2kg)',
    description: 'Double tub of buttery nutmeg chin chin — enough for the whole gathering.',
    price: 5500,
    originalPrice: 7000,
    image: 'https://images.unsplash.com/photo-1741827866638-b66eee4256be?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1741827866638-b66eee4256be?w=800&auto=format&fit=crop&q=80'],
    category: 'sweet-snacks',
    rating: 4.9,
    reviewCount: 280,
    ingredients: ['Flour', 'Evaporated Milk', 'Butter', 'Nutmeg', 'Vanilla', 'Sugar'],
    allergens: ['Gluten', 'Dairy'],
    stock: 40,
    featured: true,
    popular: true,
  },
  {
    name: 'Honey-Glazed Chin Chin Bites',
    description: 'Mini chin chin pieces lightly glazed with pure honey for extra crunch and sweetness.',
    price: 1800,
    originalPrice: 2300,
    image: 'https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/VNUF2NQB3MZVYERFYZ3FDYAOMI.jpg&w=1800&h=1800',
    images: ['https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/VNUF2NQB3MZVYERFYZ3FDYAOMI.jpg&w=1800&h=1800'],
    category: 'sweet-snacks',
    rating: 4.6,
    reviewCount: 98,
    ingredients: ['Flour', 'Honey', 'Butter', 'Nutmeg', 'Sugar'],
    allergens: ['Gluten', 'Dairy'],
    stock: 42,
    featured: false,
    popular: true,
  },
];

// ─── 3. Seeder ──────────────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/naija-snacks';

    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Connected to MongoDB successfully.');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing Categories, Products, and Users.');

    // 1. Create Categories
    const createdCategories = await Category.create(categories);
    console.log(`✅ Created ${createdCategories.length} categories.`);

    // Map by BOTH original slug and category name for guaranteed match
    const categoryMap = new Map();
    createdCategories.forEach((dbCat: any) => {
      // Map by database-generated slug
      categoryMap.set(dbCat.slug, dbCat._id);

      // Also map by original input array slug
      const originalCat = categories.find((c) => c.name === dbCat.name);
      if (originalCat) {
        categoryMap.set(originalCat.slug, dbCat._id);
      }
    });

    console.log('📋 Mapped Slugs:', Array.from(categoryMap.keys()));

    // 2. Create Products
    const productsWithCategories = products
      .map((product) => {
        const categoryId = categoryMap.get(product.category);
        if (!categoryId) {
          console.warn(`⚠️  Category "${product.category}" not found for "${product.name}"`);
          return null;
        }

        return {
          ...product,
          category: categoryId,
          slug: product.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''),
        };
      })
      .filter(Boolean);

    if (productsWithCategories.length === 0) {
      throw new Error('No valid products to create. Check category mappings.');
    }

    const createdProducts = await Product.create(productsWithCategories);
    console.log(`✅ Created ${createdProducts.length} Nigerian snacks.`);

    // 3. Update Category counts
    for (const cat of createdCategories) {
      const count = await Product.countDocuments({ category: cat._id });
      await Category.findByIdAndUpdate(cat._id, { productCount: count });
    }
    console.log('📊 Category product counts updated.');

    // 4. Metrics
    const featuredCount = await Product.countDocuments({ featured: true });
    const popularCount = await Product.countDocuments({ popular: true });
    const dealsCount = await Product.countDocuments({
      originalPrice: { $exists: true, $ne: null },
      $expr: { $gt: ['$originalPrice', '$price'] },
    });

    console.log(`\n⭐ Featured: ${featuredCount} | 🔥 Popular: ${popularCount} | 🏷️  Deals: ${dealsCount}`);

    // 5. Create Demo Users
    const hashedCustomerPassword = await bcrypt.hash('Password123', 10);
    const demoUser = await User.create({
      firstName: 'Adebayo',
      lastName: 'Ogunlesi',
      email: 'demo@naijasnacks.ng',
      password: hashedCustomerPassword,
      phone: '+2348023456789',
      role: 'customer',
      isVerified: true,
    });
    console.log(`👤 Demo customer: ${demoUser.email}`);

    const hashedAdminPassword = await bcrypt.hash('Admin123', 10);
    const adminUser = await User.create({
      firstName: 'Chef',
      lastName: 'Amaka',
      email: 'admin@naijasnacks.ng',
      password: hashedAdminPassword,
      phone: '+2348098765432',
      role: 'admin',
      isVerified: true,
    });
    console.log(`👑 Admin: ${adminUser.email}`);

    console.log('\n=============================================');
    console.log('🎉 NAIJA SNACKS SEEDED SUCCESSFULLY!');
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();