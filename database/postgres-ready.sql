-- ================= ROLES =================
CREATE TABLE roles (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR,
  notes VARCHAR
);

-- ================= MEDIA =================
CREATE TABLE media (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  url VARCHAR,
  type VARCHAR,
  upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= USERS =================
CREATE TABLE users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR,
  role_id INT,
  password VARCHAR,
  profile_picture_id INT,
  address VARCHAR,
  notes VARCHAR
);

-- ================= CUSTOMERS =================
CREATE TABLE customers (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  address VARCHAR,
  gstn VARCHAR,
  type VARCHAR,
  notes VARCHAR,
  gender VARCHAR,
  added_by INT
);

-- ================= SUPPLIERS =================
CREATE TABLE suppliers (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  gstn VARCHAR,
  address VARCHAR,
  bank_account_no VARCHAR,
  bank_ifsc VARCHAR,
  added_by INT
);

-- ================= CATEGORIES =================
CREATE TABLE categories (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR
);

-- ================= PRODUCTS =================
CREATE TABLE products (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR,
  purchase_price DECIMAL(10,2),
  sell_price DECIMAL(10,2),
  gst_rate DECIMAL(5,2),
  hsn VARCHAR,
  notes VARCHAR,
  category_id INT,
  supplier_id INT,
  added_by INT
);

-- ================= INVENTORY =================
CREATE TABLE inventory (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id INT,
  quantity INT DEFAULT 0,
  location VARCHAR,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= STOCK MOVEMENTS =================
CREATE TABLE stock_movements (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id INT,
  type VARCHAR,
  quantity INT,
  reference_type VARCHAR,
  reference_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= PURCHASE =================
CREATE TABLE purchases (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  supplier_id INT,
  total_amount DECIMAL(12,2),
  gst_amount DECIMAL(12,2),
  status VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  added_by INT
);

CREATE TABLE purchase_items (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  purchase_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,2),
  gst DECIMAL(10,2)
);

-- ================= SALES =================
CREATE TABLE sales (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id INT,
  job_card_id INT,
  total_amount DECIMAL(12,2),
  gst_amount DECIMAL(12,2),
  payment_status VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  added_by INT
);

CREATE TABLE sales_items (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sale_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,2),
  gst DECIMAL(10,2)
);

-- ================= JOB CARDS =================
CREATE TABLE job_cards (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id INT,
  status VARCHAR DEFAULT 'OPEN',
  billing_status VARCHAR DEFAULT 'NOT_BILLED',
  total_amount DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP,
  added_by INT
);

-- ================= JOB CARD DEVICES =================
CREATE TABLE job_card_items (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_card_id INT,
  device_type VARCHAR,
  brand VARCHAR,
  model VARCHAR,
  serial_number VARCHAR,
  issue TEXT,
  status VARCHAR,
  estimated_cost DECIMAL(10,2),
  final_cost DECIMAL(10,2)
);

-- ================= JOB CARD PRODUCTS =================
CREATE TABLE job_card_products (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_card_id INT,
  job_card_item_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,2),
  billed_quantity INT DEFAULT 0,
  type VARCHAR
);

-- ================= JOB CARD SERVICES =================
CREATE TABLE job_card_services (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_card_item_id INT,
  description VARCHAR,
  amount DECIMAL(10,2),
  billed BOOLEAN DEFAULT FALSE
);

-- ================= LEDGER =================
CREATE TABLE ledger_accounts (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR,
  type VARCHAR,
  related_id INT
);

CREATE TABLE ledger_entries (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id INT,
  debit DECIMAL(12,2),
  credit DECIMAL(12,2),
  reference_type VARCHAR,
  reference_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= PAYMENTS =================
CREATE TABLE payments (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type VARCHAR,
  amount DECIMAL(12,2),
  mode VARCHAR,
  reference_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Basic Info
  name VARCHAR NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  website VARCHAR,

  -- Address
  address_line1 VARCHAR,
  address_line2 VARCHAR,
  city VARCHAR,
  state VARCHAR,
  pincode VARCHAR,
  country VARCHAR DEFAULT 'India',

  -- Tax Info
  gstn VARCHAR,
  pan VARCHAR,

  -- Branding
  logo_url VARCHAR,

  -- Bank Details
  bank_name VARCHAR,
  bank_account_no VARCHAR,
  bank_ifsc VARCHAR,
  upi_id VARCHAR,

  -- Extra
  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= FOREIGN KEYS =================

ALTER TABLE users ADD FOREIGN KEY (role_id) REFERENCES roles(id);
ALTER TABLE users ADD FOREIGN KEY (profile_picture_id) REFERENCES media(id);

ALTER TABLE customers ADD FOREIGN KEY (added_by) REFERENCES users(id);
ALTER TABLE suppliers ADD FOREIGN KEY (added_by) REFERENCES users(id);
ALTER TABLE products ADD FOREIGN KEY (added_by) REFERENCES users(id);
ALTER TABLE purchases ADD FOREIGN KEY (added_by) REFERENCES users(id);
ALTER TABLE sales ADD FOREIGN KEY (added_by) REFERENCES users(id);
ALTER TABLE job_cards ADD FOREIGN KEY (added_by) REFERENCES users(id);

ALTER TABLE products ADD FOREIGN KEY (category_id) REFERENCES categories(id);
ALTER TABLE products ADD FOREIGN KEY (supplier_id) REFERENCES suppliers(id);

ALTER TABLE inventory ADD FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE stock_movements ADD FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE purchases ADD FOREIGN KEY (supplier_id) REFERENCES suppliers(id);
ALTER TABLE purchase_items ADD FOREIGN KEY (purchase_id) REFERENCES purchases(id);
ALTER TABLE purchase_items ADD FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE sales ADD FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE sales ADD FOREIGN KEY (job_card_id) REFERENCES job_cards(id);

ALTER TABLE sales_items ADD FOREIGN KEY (sale_id) REFERENCES sales(id);
ALTER TABLE sales_items ADD FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE job_cards ADD FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE job_card_items ADD FOREIGN KEY (job_card_id) REFERENCES job_cards(id);

ALTER TABLE job_card_products ADD FOREIGN KEY (job_card_id) REFERENCES job_cards(id);
ALTER TABLE job_card_products ADD FOREIGN KEY (job_card_item_id) REFERENCES job_card_items(id);
ALTER TABLE job_card_products ADD FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE job_card_services ADD FOREIGN KEY (job_card_item_id) REFERENCES job_card_items(id);

ALTER TABLE ledger_entries ADD FOREIGN KEY (account_id) REFERENCES ledger_accounts(id);