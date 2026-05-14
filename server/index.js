import express from "express";
import "dotenv/config";
import cors from "cors";
import dns from "node:dns/promises";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import designConceptRoutes from "./routes/designConceptRoutes.js";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/design-concepts", designConceptRoutes);
app.get("/", (req, res) => {
  res.send("Hello World");
});
connectDB();
if (process.env.NODE_ENV !== "production") {
  const PORT = 5000;
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
export default app;
