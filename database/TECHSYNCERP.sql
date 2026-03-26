CREATE TABLE "roles" (
  "id" int PRIMARY KEY,
  "title" varchar,
  "notes" varchar
);

CREATE TABLE "users" (
  "id" int PRIMARY KEY,
  "name" varchar,
  "role_id" int,
  "password" varchar,
  "profile_picture_id" int,
  "address" varchar,
  "notes" varchar
);

CREATE TABLE "media" (
  "id" int PRIMARY KEY,
  "url" varchar,
  "type" varchar,
  "upload_time" datetime
);

CREATE TABLE "customers" (
  "id" int PRIMARY KEY,
  "name" varchar,
  "email" varchar,
  "phone" varchar,
  "address" varchar,
  "gstn" varchar,
  "type" varchar,
  "notes" varchar,
  "gender" varchar,
  "added_by" int
);

CREATE TABLE "suppliers" (
  "id" int PRIMARY KEY,
  "name" varchar,
  "phone" varchar,
  "email" varchar,
  "gstn" varchar,
  "address" varchar,
  "bank_account_no" varchar,
  "bank_ifsc" varchar,
  "added_by" int
);

CREATE TABLE "categories" (
  "id" int PRIMARY KEY,
  "name" varchar
);

CREATE TABLE "products" (
  "id" int PRIMARY KEY,
  "name" varchar,
  "purchase_price" decimal,
  "sell_price" decimal,
  "gst_rate" decimal,
  "hsn" varchar,
  "notes" varchar,
  "category_id" int,
  "supplier_id" int,
  "added_by" int
);

CREATE TABLE "inventory" (
  "id" int PRIMARY KEY,
  "product_id" int,
  "quantity" int,
  "location" varchar,
  "last_updated" datetime
);

CREATE TABLE "stock_movements" (
  "id" int PRIMARY KEY,
  "product_id" int,
  "type" varchar,
  "quantity" int,
  "reference_type" varchar,
  "reference_id" int,
  "created_at" datetime
);

CREATE TABLE "purchases" (
  "id" int PRIMARY KEY,
  "supplier_id" int,
  "total_amount" decimal,
  "gst_amount" decimal,
  "status" varchar,
  "created_at" datetime,
  "added_by" int
);

CREATE TABLE "purchase_items" (
  "id" int PRIMARY KEY,
  "purchase_id" int,
  "product_id" int,
  "quantity" int,
  "price" decimal,
  "gst" decimal
);

CREATE TABLE "sales" (
  "id" int PRIMARY KEY,
  "customer_id" int,
  "job_card_id" int,
  "total_amount" decimal,
  "gst_amount" decimal,
  "payment_status" varchar,
  "created_at" datetime,
  "added_by" int
);

CREATE TABLE "sales_items" (
  "id" int PRIMARY KEY,
  "sale_id" int,
  "product_id" int,
  "quantity" int,
  "price" decimal,
  "gst" decimal
);

CREATE TABLE "job_cards" (
  "id" int PRIMARY KEY,
  "customer_id" int,
  "status" varchar,
  "billing_status" varchar,
  "total_amount" decimal,
  "created_at" datetime,
  "delivered_at" datetime,
  "added_by" int
);

CREATE TABLE "job_card_items" (
  "id" int PRIMARY KEY,
  "job_card_id" int,
  "device_type" varchar,
  "brand" varchar,
  "model" varchar,
  "serial_number" varchar,
  "issue" text,
  "status" varchar,
  "estimated_cost" decimal,
  "final_cost" decimal
);

CREATE TABLE "job_card_products" (
  "id" int PRIMARY KEY,
  "job_card_id" int,
  "job_card_item_id" int,
  "product_id" int,
  "quantity" int,
  "price" decimal,
  "billed_quantity" int,
  "type" varchar
);

CREATE TABLE "job_card_services" (
  "id" int PRIMARY KEY,
  "job_card_item_id" int,
  "description" varchar,
  "amount" decimal,
  "billed" boolean
);

CREATE TABLE "ledger_accounts" (
  "id" int PRIMARY KEY,
  "name" varchar,
  "type" varchar,
  "related_id" int
);

CREATE TABLE "ledger_entries" (
  "id" int PRIMARY KEY,
  "account_id" int,
  "debit" decimal,
  "credit" decimal,
  "reference_type" varchar,
  "reference_id" int,
  "created_at" datetime
);

CREATE TABLE "payments" (
  "id" int PRIMARY KEY,
  "type" varchar,
  "amount" decimal,
  "mode" varchar,
  "reference_id" int,
  "created_at" datetime
);

ALTER TABLE "users" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "users" ADD FOREIGN KEY ("profile_picture_id") REFERENCES "media" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "customers" ADD FOREIGN KEY ("added_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "suppliers" ADD FOREIGN KEY ("added_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "products" ADD FOREIGN KEY ("added_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "purchases" ADD FOREIGN KEY ("added_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "sales" ADD FOREIGN KEY ("added_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_cards" ADD FOREIGN KEY ("added_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "products" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "products" ADD FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "inventory" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "stock_movements" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "purchases" ADD FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "purchase_items" ADD FOREIGN KEY ("purchase_id") REFERENCES "purchases" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "purchase_items" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "sales" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "sales" ADD FOREIGN KEY ("job_card_id") REFERENCES "job_cards" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "sales_items" ADD FOREIGN KEY ("sale_id") REFERENCES "sales" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "sales_items" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_cards" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_card_items" ADD FOREIGN KEY ("job_card_id") REFERENCES "job_cards" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_card_products" ADD FOREIGN KEY ("job_card_id") REFERENCES "job_cards" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_card_products" ADD FOREIGN KEY ("job_card_item_id") REFERENCES "job_card_items" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_card_products" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_card_services" ADD FOREIGN KEY ("job_card_item_id") REFERENCES "job_card_items" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ledger_entries" ADD FOREIGN KEY ("account_id") REFERENCES "ledger_accounts" ("id") DEFERRABLE INITIALLY IMMEDIATE;
