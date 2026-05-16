-- Banco de dados configurado para a hospedagem informada.
-- Se o phpMyAdmin já abrir direto no banco luisaugu_financ, pode executar este arquivo normalmente.
CREATE DATABASE IF NOT EXISTS luisaugu_financ
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE luisaugu_financ;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(40),
  document VARCHAR(40),
  plan VARCHAR(40) DEFAULT 'Sem Plano',
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  preferred_currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Se a tabela users já existia antes desta versão, execute manualmente se necessário:
-- ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER plan;
-- ALTER TABLE users ADD COLUMN preferred_currency VARCHAR(10) NOT NULL DEFAULT 'BRL' AFTER avatar_url;

CREATE TABLE IF NOT EXISTS transactions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category VARCHAR(80) NOT NULL,
  transaction_date DATE NOT NULL,
  payment_status ENUM('paid', 'pending', 'overdue') NOT NULL DEFAULT 'paid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_transactions_user_date (user_id, transaction_date),
  INDEX idx_transactions_category (category),
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS financial_goals (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(180) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  deadline DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_goals_user_deadline (user_id, deadline),
  CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS category_budgets (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  category VARCHAR(80) NOT NULL,
  monthly_limit DECIMAL(12,2) NOT NULL,
  alert_percentage DECIMAL(5,2) NOT NULL DEFAULT 80,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_budget_user_category (user_id, category),
  CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  description VARCHAR(255) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category VARCHAR(80) NOT NULL,
  day_of_month TINYINT UNSIGNED NOT NULL,
  payment_status ENUM('paid', 'pending', 'overdue') NOT NULL DEFAULT 'pending',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_recurring_user_active (user_id, active),
  CONSTRAINT fk_recurring_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credit_cards (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name VARCHAR(120) NOT NULL,
  card_limit DECIMAL(12,2) NOT NULL,
  closing_day TINYINT UNSIGNED NOT NULL,
  due_day TINYINT UNSIGNED NOT NULL,
  current_invoice DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_credit_cards_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shared_accesses (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(160) NOT NULL,
  role VARCHAR(100) NOT NULL,
  permission ENUM('Visualização', 'Edição', 'Administrador') NOT NULL DEFAULT 'Visualização',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_shared_accesses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS receipts (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  transaction_id CHAR(36),
  company_name VARCHAR(180),
  cnpj VARCHAR(40),
  purchase_date DATE,
  total_amount DECIMAL(12,2),
  image_path TEXT,
  ocr_text MEDIUMTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_receipts_user_date (user_id, purchase_date),
  CONSTRAINT fk_receipts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_receipts_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS receipt_items (
  id CHAR(36) PRIMARY KEY,
  receipt_id CHAR(36) NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,3) DEFAULT 1,
  unit_price DECIMAL(12,2),
  total DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_receipt_items_receipt FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS purchase_invoices (
  id CHAR(36) PRIMARY KEY,
  plan_name VARCHAR(80) NOT NULL,
  plan_price DECIMAL(12,2) NOT NULL,
  customer_name VARCHAR(160),
  customer_email VARCHAR(160),
  customer_phone VARCHAR(40),
  user_id CHAR(36),
  status ENUM('pending', 'paid', 'cancelled') NOT NULL DEFAULT 'pending',
  source VARCHAR(60) NOT NULL DEFAULT 'site_cart',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_purchase_invoices_status (status),
  INDEX idx_purchase_invoices_created_at (created_at),
  INDEX idx_purchase_invoices_user (user_id)
);

CREATE TABLE IF NOT EXISTS site_payment_settings (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  pix_copy_paste TEXT,
  instructions_public TEXT,
  webhook_secret VARCHAR(255) NOT NULL DEFAULT '',
  webhook_enabled TINYINT(1) NOT NULL DEFAULT 0,
  gateways_json TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO site_payment_settings (id, webhook_enabled) VALUES (1, 0);

-- Matriz de permissões por perfil de plano (editável no painel ADM).
CREATE TABLE IF NOT EXISTS plan_permission_profiles (
  plan_key VARCHAR(40) PRIMARY KEY,
  permissions_json TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registo de alterações feitas por administradores (espelha criação automática em ensure_schema no PHP).
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id CHAR(36) PRIMARY KEY,
  actor_user_id CHAR(36) NOT NULL,
  actor_email VARCHAR(160) NOT NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(120) NULL,
  summary VARCHAR(512) NOT NULL,
  details_json MEDIUMTEXT NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_audit_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
