const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);  // Supprime les options obsolètes
    console.log('MongoDB connecté');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;