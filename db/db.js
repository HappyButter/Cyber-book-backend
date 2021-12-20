import neo4j from "neo4j-driver";
import dotenv from "dotenv";

dotenv.config();

const driver = neo4j.driver(process.env.DB_URI, neo4j.auth.basic(process.env.DB_USER, process.env.DB_PASSWORD));
const session = driver.session();

export default session;