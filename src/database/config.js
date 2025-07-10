
const config = {
  "development": {
    "username": process.env.DEV_USER,
    "password": process.env.DEV_PASSWORD,
    "database": process.env.DEV_DATABASE,
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
    "username": process.env.DEV_USER,
    "password": process.env.DEV_PASSWORD || null,
    "database": process.env.DEV_DATABASE,
    "host": process.env.DEV_HOST,
    "port": process.env.DEV_PORT,
    "dialect": "mysql"
  }
}

export default config;
