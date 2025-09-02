const pool = require('../config/database');

class Advertisement {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS advertisements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        location VARCHAR(100) NOT NULL,
        images TEXT[], -- Array of image URLs
        condition_type VARCHAR(20) DEFAULT 'used', -- new, used, refurbished
        contact_phone VARCHAR(20),
        contact_email VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        views_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    try {
      const result = await pool.query(query);
      console.log('Advertisements table created successfully');
    } catch (error) {
      console.error('Error creating advertisements table:', error);
      throw error;
    }
  }

  static async create(adData) {
    const {
      user_id, title, description, price, category, location,
      images, condition_type, contact_phone, contact_email
    } = adData;
    
    const query = `
      INSERT INTO advertisements (
        user_id, title, description, price, category, location,
        images, condition_type, contact_phone, contact_email
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    
    try {
      const result = await pool.query(query, [
        user_id, title, description, price, category, location,
        images, condition_type, contact_phone, contact_email
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating advertisement:', error);
      throw error;
    }
  }

  static async findAll(limit = 20, offset = 0) {
    const query = `
      SELECT 
        a.*,
        u.username as seller_name,
        u.location as seller_location
      FROM advertisements a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.is_active = true
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2;
    `;
    
    try {
      const result = await pool.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error finding advertisements:', error);
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT 
        a.*,
        u.username as seller_name,
        u.location as seller_location,
        u.phone as seller_phone
      FROM advertisements a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = $1 AND a.is_active = true;
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding advertisement by id:', error);
      throw error;
    }
  }

  static async findByCategory(category, limit = 20, offset = 0) {
    const query = `
      SELECT 
        a.*,
        u.username as seller_name,
        u.location as seller_location
      FROM advertisements a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.category = $1 AND a.is_active = true
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    
    try {
      const result = await pool.query(query, [category, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error finding advertisements by category:', error);
      throw error;
    }
  }

  static async search(query, category = null, limit = 20, offset = 0) {
    let sqlQuery = `
      SELECT 
        a.*,
        u.username as seller_name,
        u.location as seller_location
      FROM advertisements a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.is_active = true
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (query) {
      paramCount++;
      sqlQuery += ` AND (a.title ILIKE $${paramCount} OR a.description ILIKE $${paramCount})`;
      params.push(`%${query}%`);
    }
    
    if (category) {
      paramCount++;
      sqlQuery += ` AND a.category = $${paramCount}`;
      params.push(category);
    }
    
    sqlQuery += ` ORDER BY a.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    try {
      const result = await pool.query(sqlQuery, params);
      return result.rows;
    } catch (error) {
      console.error('Error searching advertisements:', error);
      throw error;
    }
  }

  static async update(id, updateData) {
    const {
      title, description, price, category, location,
      images, condition_type, contact_phone, contact_email
    } = updateData;
    
    const query = `
      UPDATE advertisements 
      SET 
        title = $1, description = $2, price = $3, category = $4, location = $5,
        images = $6, condition_type = $7, contact_phone = $8, contact_email = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *;
    `;
    
    try {
      const result = await pool.query(query, [
        title, description, price, category, location,
        images, condition_type, contact_phone, contact_email, id
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating advertisement:', error);
      throw error;
    }
  }

  static async delete(id) {
    const query = 'UPDATE advertisements SET is_active = false WHERE id = $1 RETURNING id;';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      throw error;
    }
  }

  static async incrementViews(id) {
    const query = 'UPDATE advertisements SET views_count = views_count + 1 WHERE id = $1;';
    
    try {
      await pool.query(query, [id]);
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  }
}

module.exports = Advertisement;

