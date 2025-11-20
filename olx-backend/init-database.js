const User = require('./models/User');
const Advertisement = require('./models/Advertisement');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Create tables in correct order (users first, then advertisements, then dependent tables)
    await User.createTable();
    await Advertisement.createTable();
    await Message.createTable();
    await Notification.createTable();

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error; // Don't exit process, let the caller handle it
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
