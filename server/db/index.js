import { Pool } from "pg";
import dotenv from "dotenv"

dotenv.config()

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: 5432, // optional but recommended
});

const query = (text, params) => pool.query(text, params);

export { pool, query };
