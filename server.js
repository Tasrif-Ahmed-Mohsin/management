const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop' },
  dateAdded: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// API Routes
// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seed database
app.get('/api/seed', async (req, res) => {
  try {
    // Sample products
    const sampleProducts = [
      {
        name: 'Wireless Headphones',
        category: 'Electronics',
        price: 89.99,
        stock: 15,
        description: 'Premium noise-canceling wireless headphones with 30 hours of battery life and comfortable over-ear design.',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
      },
      {
        name: 'Smart Watch',
        category: 'Electronics',
        price: 199.99,
        stock: 8,
        description: 'Track your fitness goals, receive notifications, and more with this water-resistant smart watch.',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'
      },
      {
        name: 'Yoga Mat',
        category: 'Fitness',
        price: 29.95,
        stock: 20,
        description: 'Non-slip, eco-friendly yoga mat perfect for all types of yoga and floor exercises.',
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=300&fit=crop'
      },
      {
        name: 'Coffee Maker',
        category: 'Kitchen',
        price: 59.99,
        stock: 12,
        description: 'Programmable coffee maker with 12-cup capacity and auto-shutoff feature.',
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop'
      },
      {
        name: 'Desk Lamp',
        category: 'Office',
        price: 34.50,
        stock: 25,
        description: 'Adjustable LED desk lamp with multiple brightness levels and color temperatures.',
        imageUrl: 'https://images.unsplash.com/photo-1534282033039-bd5fb7023633?w=300&h=300&fit=crop'
      },
      {
        name: 'Backpack',
        category: 'Sports',
        price: 49.95,
        stock: 18,
        description: 'Durable, water-resistant backpack with multiple compartments and laptop sleeve.',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop'
      }
    ];

    // Clear existing products
    await Product.deleteMany({});
    
    // Insert sample products
    const seededProducts = await Product.insertMany(sampleProducts);
    
    res.json({ 
      message: 'Database seeded successfully',
      count: seededProducts.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});