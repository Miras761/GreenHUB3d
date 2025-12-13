import express from 'express';
import Category from '../models/Category.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'username avatar');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create category (only logged in users)
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      createdBy: req.user._id,
      icon: icon || ''
    });

    const populatedCategory = await Category.findById(category._id)
      .populate('createdBy', 'username avatar');

    res.status(201).json(populatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
