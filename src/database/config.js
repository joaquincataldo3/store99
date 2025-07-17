
import dotenv from "dotenv";
dotenv.config();
const config = {
  "development": {
    "username": process.env.USER,
    "password": process.env.PASSWORD || null,
    "database": process.env.DATABASE,
    "host": '127.0.0.1',
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.USER,
    "password": process.env.PASSWORD || null,
    "database": process.env.DATABASE,
    "host": process.env.HOST,
    "port": process.env.PORT,
    "dialect": "mysql"
  }
}

export default config;
