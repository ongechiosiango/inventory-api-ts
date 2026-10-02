import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { productsRouter } from "./routes/products";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

// 👇 Serve static files from /public (index.html, style.css, app.js)
app.use(express.static("public"));

// API routes
app.use("/products", productsRouter);

// 404 + error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🌐 Inventory API → http://localhost:${env.PORT}`);
});