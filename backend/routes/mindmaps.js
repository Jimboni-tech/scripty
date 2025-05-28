// routes/mindmaps.js
const express = require('express');
const router = express.Router();
const MindMap = require('../models/MindMap');
const { protect } = require('../middleware/authMiddleware'); // Auth middleware

// @route   POST /api/mindmaps
// @desc    Create a new mind map
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, nodes, connections, viewState } = req.body;

  try {
    // req.user.id is available from the 'protect' middleware
    const newMindMap = new MindMap({
      user: req.user.id,
      title: title || `Mind Map by ${req.user.email}`, // Default title if not provided
      nodes: nodes || [{ id: '1', x: 400, y: 300, title: 'Central Idea', text: '', isRoot: true, color: '#dc2626' }],
      connections: connections || [],
      viewState: viewState || { translateX: 0, translateY: 0 },
    });

    const mindMap = await newMindMap.save();
    res.status(201).json(mindMap);
  } catch (error) {
    console.error('Error creating mind map:', error.message);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while creating mind map' });
  }
});

// @route   GET /api/mindmaps
// @desc    Get all mind maps for the logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const mindMaps = await MindMap.find({ user: req.user.id }).sort({ updatedAt: -1 }); // Sort by most recently updated
    res.json(mindMaps);
  } catch (error) {
    console.error('Error fetching mind maps:', error.message);
    res.status(500).json({ message: 'Server error while fetching mind maps' });
  }
});

// @route   GET /api/mindmaps/:id
// @desc    Get a specific mind map by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const mindMap = await MindMap.findById(req.params.id);

    if (!mindMap) {
      return res.status(404).json({ message: 'Mind map not found' });
    }

    // Ensure the mind map belongs to the logged-in user
    if (mindMap.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to access this mind map' });
    }

    res.json(mindMap);
  } catch (error) {
    console.error('Error fetching single mind map:', error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Mind map not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while fetching mind map' });
  }
});

// @route   PUT /api/mindmaps/:id
// @desc    Update a mind map
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { title, nodes, connections, viewState } = req.body;

  try {
    let mindMap = await MindMap.findById(req.params.id);

    if (!mindMap) {
      return res.status(404).json({ message: 'Mind map not found' });
    }

    // Ensure the mind map belongs to the logged-in user
    if (mindMap.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this mind map' });
    }

    // Update fields if provided
    if (title !== undefined) mindMap.title = title;
    if (nodes !== undefined) mindMap.nodes = nodes;
    if (connections !== undefined) mindMap.connections = connections;
    if (viewState !== undefined) mindMap.viewState = viewState;
    mindMap.updatedAt = Date.now(); // Explicitly set updatedAt

    const updatedMindMap = await mindMap.save();
    res.json(updatedMindMap);
  } catch (error) {
    console.error('Error updating mind map:', error.message);
     if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Mind map not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while updating mind map' });
  }
});

// @route   DELETE /api/mindmaps/:id
// @desc    Delete a mind map
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const mindMap = await MindMap.findById(req.params.id);

    if (!mindMap) {
      return res.status(404).json({ message: 'Mind map not found' });
    }

    // Ensure the mind map belongs to the logged-in user
    if (mindMap.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this mind map' });
    }

    await mindMap.deleteOne(); // Mongoose v6+ uses deleteOne() on the document

    res.json({ message: 'Mind map removed successfully' });
  } catch (error) {
    console.error('Error deleting mind map:', error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Mind map not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while deleting mind map' });
  }
});

module.exports = router;
