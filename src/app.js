import express from "express";
const app = express();
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import memorystore from "memorystore";
import viewsRouter from './routes/views/views.routes.js';
import usersRouter from './routes/api/users.routes.js';
import brandsRouter from './routes/api/brands.routes.js';
import modelsRouter from './routes/api/models.routes.js';
import sizesRouter from './routes/api/sizes.routes.js';
import categoriesController from './routes/api/categories.routes.js';
import stocksController from './routes/api/stocks.routes.js';
import dotenv from "dotenv";
dotenv.config();
const MemoryStore = memorystore(session);

// way to replace __dirname in es modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "./pages"));
app.use(express.static("./public"));

// Para capturar el body
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("trust proxy", 1); // Configura Express para confiar en el primer proxy

let sessionObject = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
};

if (process.env.NODE_ENV === "production") {
  sessionObject.store = new MemoryStore({
    checkPeriod: 86400000, // Limpia las sesiones expiradas cada 24 horas
  });
}
app.use(session(sessionObject));

// Cookie-parser
app.use(cookieParser());

// Mehtod-override --> Para usar put y delete (?_method=...)
app.use(methodOverride("_method"));

app.use('/', viewsRouter)
app.use('/api/user', usersRouter)
app.use('/api/brand', brandsRouter)
app.use('/api/model', modelsRouter)
app.use('/api/size', sizesRouter)
app.use('/api/category', categoriesController)
app.use('/api/stock', stocksController)

const PORT = process.env.PORT || 3500;

//404
app.use((req, res, next) => {
  return res.status(404).render('not-found');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Proyecto levantado en http://0.0.0.0:${PORT}`);
});
