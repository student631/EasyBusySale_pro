const User = require('./models/User');
const Advertisement = require('./models/Advertisement');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create tables
    await User.createTable();
    await Advertisement.createTable();
    
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
