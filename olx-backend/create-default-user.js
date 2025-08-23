const User = require('./models/User');
const pool = require('./config/database');

async function createDefaultUser() {
  try {
    console.log('Creating default user...');
    
    // Check if user already exists
    const existingUser = await User.findByEmail('admin@olx.com');
    if (existingUser) {
      console.log('Default user already exists!');
      return existingUser;
    }
    
    // Create default user
    const userData = {
      username: 'admin',
      email: 'admin@olx.com',
      password_hash: 'default_password_hash', // This will be replaced with proper hashing later
      full_name: 'Admin User',
      phone: '1234567890',
      location: 'Mumbai, Maharashtra'
    };
    
    const newUser = await User.create(userData);
    console.log('✅ Default user created successfully!');
    console.log('User ID:', newUser.id);
    return newUser;
    
  } catch (error) {
    console.error('Error creating default user:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createDefaultUser()
    .then(() => {
      console.log('Default user setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create default user:', error);
      process.exit(1);
    });
}

module.exports = createDefaultUser;
