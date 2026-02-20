-- =============================================
-- D1 Cloudflare Database Schema
-- For Pat CMS Application
-- Safe for Local D1
-- =============================================

-- ---------------------------------------------
-- DROP EXISTING TABLES (for local development)
-- ---------------------------------------------
DROP TABLE IF EXISTS blog_logs;
DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

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
-- PROJECTS TABLE
-- ---------------------------------------------
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
);

CREATE INDEX idx_projects_user_id ON projects(user_id);

-- ---------------------------------------------
-- BLOGS TABLE
-- ---------------------------------------------
CREATE TABLE blogs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  content TEXT,
  meta_description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  image_url TEXT,
  project_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
);

CREATE INDEX idx_blogs_user_id ON blogs(user_id);
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX idx_blogs_project_id ON blogs(project_id);

-- ---------------------------------------------
-- BLOG LOGS TABLE
-- ---------------------------------------------
CREATE TABLE blog_logs (
  id TEXT PRIMARY KEY,
  blog_id TEXT,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'published', 'deleted')),
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
);

CREATE INDEX idx_blog_logs_blog_id ON blog_logs(blog_id);
CREATE INDEX idx_blog_logs_user_id ON blog_logs(user_id);
CREATE INDEX idx_blog_logs_created_at ON blog_logs(created_at DESC);


