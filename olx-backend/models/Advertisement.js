const pool = require('../config/database');

class Advertisement {
  // Helper function to generate SEO-friendly slug from title
  static generateSlug(title, id = null) {
    if (!title) return '';

    // Convert to lowercase and replace special characters
    let slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .substring(0, 200); // Limit length

    // Add ID suffix for uniqueness if provided
    if (id) {
      slug = `${slug}-${id}`;
    }

    return slug;
  }

  // Helper function to extract ID from slug
  static extractIdFromSlug(slug) {
    if (!slug) return null;

    // Extract the last numeric segment (the ID)
    const parts = slug.split('-');
    const lastPart = parts[parts.length - 1];

    // Check if it's a valid number
    const id = parseInt(lastPart, 10);
    return isNaN(id) ? null : id;
  }

  // Helper function to normalize image URLs
  static normalizeImageUrls(images) {
    if (!images || !Array.isArray(images)) return [];

    return images.map(imagePath => {
      if (!imagePath) return '';

      // If already a full URL, return as-is
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }

      // If it starts with '/uploads/', convert to full URL
      if (imagePath.startsWith('/uploads/')) {
        return `http://localhost:5000${imagePath}`;
      }

      // If it doesn't start with '/', add uploads prefix
      if (!imagePath.startsWith('/')) {
        return `http://localhost:5000/uploads/${imagePath}`;
      }

      return `http://localhost:5000${imagePath}`;
    });
  }
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS advertisements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
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

    // Auto-generate SEO metadata
    const { generateSeoTitle, generateSeoDescription, generateSeoKeywords } = require('../utils/seoHelper');
    const seoTitle = generateSeoTitle(title, category, condition_type, location);
    const seoDescription = generateSeoDescription(description, price, condition_type, location);
    const seoKeywords = generateSeoKeywords(title, category, condition_type, location, description);

    const query = `
      INSERT INTO advertisements (
        user_id, title, description, price, category, location,
        images, condition_type, contact_phone, contact_email,
        seo_title, seo_description, seo_keywords
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    try {
      const result = await pool.query(query, [
        user_id, title, description, price, category, location,
        images, condition_type, contact_phone, contact_email,
        seoTitle, seoDescription, seoKeywords
      ]);

      const newAd = result.rows[0];

      // Generate and update slug with the newly created ID
      const slug = this.generateSlug(title, newAd.id);
      await pool.query('UPDATE advertisements SET slug = $1 WHERE id = $2', [slug, newAd.id]);

      // Return ad with slug
      newAd.slug = slug;
      console.log(`✅ SEO metadata auto-generated for ad: "${title}"`);
      return newAd;
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
      // Normalize image URLs for all ads
      return result.rows.map(ad => ({
        ...ad,
        images: this.normalizeImageUrls(ad.images)
      }));
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
      const ad = result.rows[0];
      if (ad) {
        ad.images = this.normalizeImageUrls(ad.images);
      }
      return ad;
    } catch (error) {
      console.error('Error finding advertisement by id:', error);
      throw error;
    }
  }

  static async findBySlug(slug) {
    const query = `
      SELECT
        a.*,
        u.username as seller_name,
        u.location as seller_location,
        u.phone as seller_phone
      FROM advertisements a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.slug = $1 AND a.is_active = true;
    `;

    try {
      const result = await pool.query(query, [slug]);
      const ad = result.rows[0];
      if (ad) {
        ad.images = this.normalizeImageUrls(ad.images);
      }
      return ad;
    } catch (error) {
      console.error('Error finding advertisement by slug:', error);
      throw error;
    }
  }

  static async findByIdOrSlug(identifier) {
    // Check if identifier is numeric (ID) or string (slug)
    const isNumeric = !isNaN(identifier) && !isNaN(parseFloat(identifier));

    if (isNumeric) {
      return this.findById(identifier);
    }

    // Could be a slug, try to find by slug first
    const adBySlug = await this.findBySlug(identifier);
    if (adBySlug) {
      return adBySlug;
    }

    // Fallback: try to extract ID from slug format
    const extractedId = this.extractIdFromSlug(identifier);
    if (extractedId) {
      return this.findById(extractedId);
    }

    return null;
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
    // Build dynamic query based on provided fields
    const updateFields = [];
    const params = [];
    let paramCount = 0;

    if (updateData.title !== undefined) {
      paramCount++;
      updateFields.push(`title = $${paramCount}`);
      params.push(updateData.title);
    }
    if (updateData.description !== undefined) {
      paramCount++;
      updateFields.push(`description = $${paramCount}`);
      params.push(updateData.description);
    }
    if (updateData.price !== undefined) {
      paramCount++;
      updateFields.push(`price = $${paramCount}`);
      params.push(updateData.price);
    }
    if (updateData.category !== undefined) {
      paramCount++;
      updateFields.push(`category = $${paramCount}`);
      params.push(updateData.category);
    }
    if (updateData.location !== undefined) {
      paramCount++;
      updateFields.push(`location = $${paramCount}`);
      params.push(updateData.location);
    }
    if (updateData.images !== undefined) {
      paramCount++;
      updateFields.push(`images = $${paramCount}`);
      params.push(updateData.images);
    }
    if (updateData.condition_type !== undefined) {
      paramCount++;
      updateFields.push(`condition_type = $${paramCount}`);
      params.push(updateData.condition_type);
    }
    if (updateData.contact_phone !== undefined) {
      paramCount++;
      updateFields.push(`contact_phone = $${paramCount}`);
      params.push(updateData.contact_phone);
    }
    if (updateData.contact_email !== undefined) {
      paramCount++;
      updateFields.push(`contact_email = $${paramCount}`);
      params.push(updateData.contact_email);
    }

    // Always update the updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    paramCount++;
    params.push(id);

    const query = `
      UPDATE advertisements
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND is_active = true
      RETURNING *;
    `;

    try {
      const result = await pool.query(query, params);
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

  static async findByUserId(userId, limit = 20, offset = 0) {
    const query = `
      SELECT
        a.*,
        u.username as seller_name,
        u.location as seller_location
      FROM advertisements a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.user_id = $1 AND a.is_active = true
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3;
    `;

    try {
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error finding advertisements by user ID:', error);
      throw error;
    }
  }

  static async getTotalCount(searchQuery = null, category = null) {
    let query = `
      SELECT COUNT(*) as total
      FROM advertisements a
      WHERE a.is_active = true
    `;

    const params = [];
    let paramCount = 0;

    if (searchQuery) {
      paramCount++;
      query += ` AND (a.title ILIKE $${paramCount} OR a.description ILIKE $${paramCount})`;
      params.push(`%${searchQuery}%`);
    }

    if (category) {
      paramCount++;
      query += ` AND a.category = $${paramCount}`;
      params.push(category);
    }

    try {
      const result = await pool.query(query, params);
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error('Error getting total count:', error);
      throw error;
    }
  }

  static async getFeatured(limit = 8) {
    const query = `
      SELECT
        a.*,
        u.username as seller_name,
        u.location as seller_location
      FROM advertisements a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.is_active = true
      ORDER BY a.views_count DESC, a.created_at DESC
      LIMIT $1;
    `;

    try {
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting featured ads:', error);
      throw error;
    }
  }

  static async getByLocation(location, limit = 20, offset = 0) {
    const query = `
      SELECT
        a.*,
        u.username as seller_name,
        u.location as seller_location
      FROM advertisements a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.is_active = true AND a.location ILIKE $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3;
    `;

    try {
      const result = await pool.query(query, [`%${location}%`, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error finding advertisements by location:', error);
      throw error;
    }
  }

  static async markAsSold(id) {
    const query = `
      UPDATE advertisements
      SET
        is_active = false,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error marking advertisement as sold:', error);
      throw error;
    }
  }

  static async getCategories() {
    const query = `
      SELECT
        category,
        COUNT(*) as count
      FROM advertisements
      WHERE is_active = true
      GROUP BY category
      ORDER BY count DESC;
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  static async getSimilar(id, category, limit = 4) {
    const query = `
      SELECT
        a.*,
        u.username as seller_name,
        u.location as seller_location
      FROM advertisements a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.is_active = true
      AND a.category = $1
      AND a.id != $2
      ORDER BY RANDOM()
      LIMIT $3;
    `;

    try {
      const result = await pool.query(query, [category, id, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting similar ads:', error);
      throw error;
    }
  }
}

module.exports = Advertisement;

