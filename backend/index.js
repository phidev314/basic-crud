import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/Database.js";
import "./models/UserModel.js";
import "./models/AdminModel.js";
import "./models/ProductCategoryModel.js";
import "./models/ProductModel.js";
import UserRoute from "./routes/UserRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import ProductRoute from "./routes/ProductRoute.js";
import ProductCategoryRoute from "./routes/ProductCategoryRoute.js";

dotenv.config(); // untuk membaca file .env dan environment variables di dalamnya

const app = express();
const PORT = process.env.PORT;

// sync db
(async () => {
  try {
    await db.sync();
    console.log("Database synchronized successfully.");
  } catch (error) {
    console.error("Database connection error:", error.message);
  }
})();

app.use(cors());
app.use(express.json());

// routes
app.use(AuthRoute);
app.use(UserRoute);
app.use(ProductRoute);
app.use(ProductCategoryRoute);

app.listen(PORT, () => console.log(`Server up and running on port ${PORT}...`));
