require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Category = require('../models/category.model');

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create category
    let category = await Category.findOne({ slug: 'fruits' });
    if (!category) {
      category = await Category.create({
        name: 'Fruits',
        slug: 'fruits',
        description: 'Fresh organic fruits'
      });
      console.log('✅ Category created');
    }

    // Create test products
    const products = await Product.insertMany([
      {
        name: 'Fresh Red Apple',
        description: 'Delicious organic red apples from Himalayan region',
        category: category._id,
        images: ['https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500'],
        price: 150,
        originalPrice: 200,
        stock: 100,
        productType: 'fruit',
        unit: 'kg',
        isOrganic: true,
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Organic Banana',
        description: 'Fresh organic bananas',
        category: category._id,
        images: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500'],
        price: 80,
        originalPrice: 100,
        stock: 150,
        productType: 'fruit',
        unit: 'dozen',
        isOrganic: true,
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Orange Premium',
        description: 'Sweet and juicy oranges',
        category: category._id,
        images: ['https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=500'],
        price: 120,
        originalPrice: 150,
        stock: 80,
        productType: 'fruit',
        unit: 'kg',
        isOrganic: false,
        isActive: true,
        isFeatured: true,
      }
    ]);

    console.log('\n✅ Products created successfully!\n');
    console.log('📝 Product IDs:');
    products.forEach(p => {
      console.log(`   - ${p.name}: ${p._id}`);
      console.log(`     Slug: ${p.slug}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedProducts();