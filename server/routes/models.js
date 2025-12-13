import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Model from '../models/Model.js';
import { protect } from '../middleware/auth.js';
import { deleteFile } from '../utils/fileUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/models'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedFormats = ['.gltf', '.glb', '.fbx', '.obj', '.3ds', '.dae', '.blend'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Allowed: gltf, glb, fbx, obj, 3ds, dae, blend'));
    }
  }
});

// Get all models
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const models = await Model.find(query)
      .populate('author', 'username avatar')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Model.countDocuments(query);

    res.json({
      models,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single model
router.get('/:id', async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
      .populate('author', 'username avatar bio')
      .populate('category', 'name');

    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    // Increment views
    model.views += 1;
    await model.save();

    res.json(model);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload model (only logged in users)
router.post('/', protect, upload.single('model'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, category, license, tags, hasAnimation } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required' });
    }

    const fileUrl = `/uploads/models/${req.file.filename}`;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    const fileFormat = path.extname(fileName).toLowerCase().slice(1);

    const model = await Model.create({
      title,
      description: description || '',
      author: req.user._id,
      category,
      license: license || 'CC0',
      fileUrl,
      fileName,
      fileSize,
      fileFormat,
      hasAnimation: hasAnimation === 'true',
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });

    const populatedModel = await Model.findById(model._id)
      .populate('author', 'username avatar')
      .populate('category', 'name');

    res.status(201).json(populatedModel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update model
router.put('/:id', protect, async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);

    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    if (model.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, category, license, tags, hasAnimation } = req.body;

    model.title = title || model.title;
    model.description = description !== undefined ? description : model.description;
    model.category = category || model.category;
    model.license = license || model.license;
    model.tags = tags ? tags.split(',').map(t => t.trim()) : model.tags;
    model.hasAnimation = hasAnimation !== undefined ? hasAnimation === 'true' : model.hasAnimation;
    model.updatedAt = Date.now();

    await model.save();

    const populatedModel = await Model.findById(model._id)
      .populate('author', 'username avatar')
      .populate('category', 'name');

    res.json(populatedModel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete model
router.delete('/:id', protect, async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);

    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    if (model.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete file
    await deleteFile(path.join(__dirname, '..', model.fileUrl));

    await Model.findByIdAndDelete(req.params.id);

    res.json({ message: 'Model deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like model (only once per user)
router.post('/:id/like', protect, async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);

    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    if (model.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already liked this model' });
    }

    model.likes.push(req.user._id);
    await model.save();

    res.json({ message: 'Model liked successfully', likesCount: model.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unlike model
router.post('/:id/unlike', protect, async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);

    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    model.likes = model.likes.filter(
      id => id.toString() !== req.user._id.toString()
    );
    await model.save();

    res.json({ message: 'Model unliked successfully', likesCount: model.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download model
router.get('/:id/download', async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);

    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    // Increment downloads
    model.downloads += 1;
    await model.save();

    const filePath = path.join(__dirname, '..', model.fileUrl);
    res.download(filePath, model.fileName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
