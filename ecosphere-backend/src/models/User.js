const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1 AND is_active = TRUE', [email]);
    return result.rows[0] || null;
  }

  static async findById(id) {
    const result = await query(
      'SELECT id, name, email, role, department, xp, avatar_url, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create({ name, email, password, role = 'employee', department }) {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, department)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, department, xp`,
      [name, email, password_hash, role, department]
    );
    return result.rows[0];
  }

  static async comparePassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  }

  static async updateXP(userId, xpToAdd) {
    const result = await query(
      'UPDATE users SET xp = xp + $1 WHERE id = $2 RETURNING xp',
      [xpToAdd, userId]
    );
    return result.rows[0];
  }

  static async getLeaderboard(limit = 10) {
    const result = await query(
      `SELECT id, name, department, xp, role FROM users 
       WHERE is_active = TRUE ORDER BY xp DESC LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}

module.exports = User;
