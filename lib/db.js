import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",       
  host: "localhost",      
  database: "shoes", 
  password: "yourpassword",
  port: 5432,              
});

export default pool;
