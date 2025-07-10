import express from "express";
const app = express();
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config.js"; // En ESM se importa asi
import session from "express-session";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";

import memorystore from "memorystore";
const MemoryStore = memorystore(session);

// way to replace __dirname in es modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "./views"));
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

const PORT = process.env.PORT || 3500;

//404
app.use((req, res, next) => {
  res.status(404);
  return res.redirect("/");
});

app.listen(PORT, () => {
  console.log(" 🚀 Se levanto proyecto en puerto " + PORT);
});
