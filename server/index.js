import express from "express";
import "dotenv/config";
import cors from "cors";
import dns from "node:dns/promises";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("Hello World");
});
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});
