import mongoose from 'mongoose';

const licenseTypes = ['CC0', 'CC4', 'Attribution', 'Non-commercial'];

const modelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 5000,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  license: {
    type: String,
    enum: licenseTypes,
    required: true,
    default: 'CC0'
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileFormat: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  hasAnimation: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

modelSchema.index({ title: 'text', description: 'text', tags: 'text' });
modelSchema.index({ createdAt: -1 });
modelSchema.index({ likes: -1 });

export default mongoose.model('Model', modelSchema);
