import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { create, read } from "./MongoDB.js";
import cors from "cors"; // Import cors

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(
    cors({
      origin: "http://localhost:5173", // Hanya mengizinkan dari front-end
    })
  );



// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
