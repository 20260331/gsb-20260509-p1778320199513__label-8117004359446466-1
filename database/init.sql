-- Blog System Database Initialization
-- MySQL 8.0

-- Set character encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection = utf8mb4;

CREATE DATABASE IF NOT EXISTS blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blog_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor', 'user') DEFAULT 'user',
    avatar VARCHAR(255) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT NOT NULL,
    summary VARCHAR(500) DEFAULT NULL,
    cover_image VARCHAR(255) DEFAULT NULL,
    author_id INT NOT NULL,
    category_id INT DEFAULT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Article-Tag relationship table
CREATE TABLE IF NOT EXISTS article_tags (
    article_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: password123)
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@blog.com', '$2a$10$03/DS74i/H3CcUclZeEJXesLPqXffgZBKUBfnIew44k64b8kL.Pcy', 'admin');

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('技术', '技术相关文章'),
('生活', '生活随笔'),
('随想', '随想感悟');

-- Insert default tags
INSERT INTO tags (name) VALUES
('Vue'),
('JavaScript'),
('TypeScript'),
('Node.js'),
('Docker');

-- Insert default settings
INSERT INTO settings (setting_key, setting_value) VALUES
('site_title', 'My Blog'),
('site_description', '一个现代化的博客系统'),
('site_keywords', '博客,技术,生活'),
('site_logo', ''),
('footer_text', '© 2026 My Blog. All rights reserved.');
