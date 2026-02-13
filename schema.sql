-- =============================================
-- D1 Cloudflare Database Schema
-- For Pat CMS Application
-- =============================================

-- ---------------------------------------------
-- USERS TABLE
-- ---------------------------------------------
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ---------------------------------------------
-- BLOGS TABLE
-- ---------------------------------------------
CREATE TABLE blogs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT,
  meta_description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  image_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_blogs_user_id ON blogs(user_id);
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC);

-- ---------------------------------------------
-- BLOG LOGS TABLE
-- ---------------------------------------------
CREATE TABLE blog_logs (
  id TEXT PRIMARY KEY,
  blog_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'published', 'deleted')),
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_blog_logs_blog_id ON blog_logs(blog_id);
CREATE INDEX idx_blog_logs_user_id ON blog_logs(user_id);
CREATE INDEX idx_blog_logs_created_at ON blog_logs(created_at DESC);

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Insert sample admin user (password: admin123)
-- INSERT INTO users (id, email, password_hash, name, role)
-- VALUES ('usr_123', 'admin@example.com', '$2a$10$hash_here', 'Admin User', 'admin');

-- Insert sample client user (password: client123)
-- INSERT INTO users (id, email, password_hash, name, role)
-- VALUES ('usr_456', 'client@example.com', '$2a$10$hash_here', 'Client User', 'client');
