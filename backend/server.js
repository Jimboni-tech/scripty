// server.js
//password - VUuLxXFxnDwbdQHg
//connection string - mongodb+srv://jimmyzhou0818:VUuLxXFxnDwbdQHg@scripty.tfefmg8.mongodb.net/?retryWrites=true&w=majority&appName=scripty
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // Import DB connection function

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB Database
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Change this if your frontend runs elsewhere
  credentials: true
})); // Enable Cross-Origin Resource Sharing with credentials
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // To parse URL-encoded request bodies

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('Mind Map API Running');
});

// Define Routes
app.use('/api/auth', require('./routes/auth')); // Mount authentication routes
app.use('/api/mindmaps', require('./routes/mindmaps')); // Mount mind map routes

// Error Handling Middleware (Optional but recommended)
// This should be defined after all other app.use() and routes calls
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send('Something broke!');
});


// Define the port
const PORT = process.env.PORT || 5001; // Use port from .env or default to 5001

// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});