// config/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const connectDB = async () => {
  try {
    const baseUri = process.env.MONGODB_URI;
    // Define your desired database name here
    const databaseToUse = 'mindmaps'; // <<<< CHANGE THIS if you want a different name, e.g., yourAppNameDB

    // Critical check for the URI scheme
    if (!baseUri || !(baseUri.startsWith('mongodb://') || baseUri.startsWith('mongodb+srv://'))) {
      console.error(
        'MongoDB Connection Error: Invalid MONGODB_URI in .env file.' +
        ' It MUST start with "mongodb://" or "mongodb+srv://".'
      );
      console.error('Current MONGODB_URI value:', baseUri);
      process.exit(1); // Exit if URI is fundamentally wrong
    }

    console.log(`Attempting to connect to MongoDB using base URI: ${baseUri}`);
    console.log(`Targeting database: ${databaseToUse}`);

    // Attempt to connect to MongoDB
    await mongoose.connect(baseUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: databaseToUse, // Explicitly specify the database name here
    });

    console.log(`MongoDB Connected Successfully to database: ${mongoose.connection.name}`);

  } catch (err) {
    console.error('MongoDB Connection Error during connect attempt:', err.message);
    if (err.message.toLowerCase().includes('bad auth') || err.message.toLowerCase().includes('authentication failed')) {
      console.error('Authentication Error: Please double-check your username and password in the MONGODB_URI, and ensure the user has permissions for the database and IP access is configured in Atlas.');
    } else if (err.message.toLowerCase().includes('invalid scheme')) {
      console.error('Invalid Scheme Error: Your MONGODB_URI in the .env file is malformed. It MUST start with "mongodb://" or "mongodb+srv://".');
    }
    process.exit(1);
  }
};

module.exports = connectDB;