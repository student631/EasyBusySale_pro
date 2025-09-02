const pool = require('../config/database');

class User {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        phone VARCHAR(20),
        location VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    try {
      const result = await pool.query(query);
      console.log('Users table created successfully');
    } catch (error) {
      console.error('Error creating users table:', error);
      throw error;
    }
  }

  static async create(userData) {
    const { username, email, password_hash, full_name, phone, location } = userData;
    const query = `
      INSERT INTO users (username, email, password_hash, full_name, phone, location)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, full_name, phone, location, created_at;
    `;
    
    try {
      const result = await pool.query(query, [username, email, password_hash, full_name, phone, location]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findById(id) {
    const query = 'SELECT id, username, email, full_name, phone, location, created_at FROM users WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }
  }

  static async update(id, updateData) {
    const { full_name, phone, location } = updateData;
    const query = `
      UPDATE users 
      SET full_name = $1, phone = $2, location = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, username, email, full_name, phone, location, updated_at;
    `;
    
    try {
      const result = await pool.query(query, [full_name, phone, location, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
}

module.exports = User;

