import { pool } from './db.js';

export async function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    const user = await pool.query('SELECT role, is_active FROM users WHERE id = $1', [req.session.userId]);
    if (!user.rowCount || !user.rows[0].is_active) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Account unavailable.' });
    }
    req.session.role = user.rows[0].role;
    next();
  } catch (error) {
    next(error);
  }
}

export async function requireAdmin(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    const user = await pool.query('SELECT role, is_active FROM users WHERE id = $1', [req.session.userId]);
    if (!user.rowCount || !user.rows[0].is_active) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Account unavailable.' });
    }
    req.session.role = user.rows[0].role;
    if (user.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Administrator access required.' });
    }
    next();
  } catch (error) {
    next(error);
  }
}

export function validate(schema, body) {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw Object.assign(new Error(message), { status: 400 });
  }
  return parsed.data;
}
