// models/MindMap.js
const mongoose = require('mongoose');

// Define the MindMap schema
const MindMapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User who owns this mind map
    required: true,
    ref: 'User', // Refers to the 'User' model
  },
  title: {
    type: String,
    required: [true, 'Mind map title is required'],
    trim: true,
    default: 'My Mind Map',
  },
  nodes: {
    type: mongoose.Schema.Types.Mixed, // Using Mixed for flexibility with node structure
    required: true,
    default: [{ id: '1', x: 400, y: 300, title: 'Central Idea', text: '', isRoot: true, color: '#dc2626' }],
  },
  connections: {
    type: mongoose.Schema.Types.Mixed, // Using Mixed for flexibility
    required: true,
    default: [],
  },
  viewState: { // To store pan and zoom, or other view-related settings
    translateX: { type: Number, default: 0 },
    translateY: { type: Number, default: 0 },
    // zoom: { type: Number, default: 1 } // Example for zoom
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update `updatedAt` field before saving
MindMapSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the MindMap model
const MindMap = mongoose.model('MindMap', MindMapSchema);
module.exports = MindMap;
