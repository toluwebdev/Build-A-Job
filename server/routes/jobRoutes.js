import express from "express";
import { fetchJobs, requestJob } from "../controllers/jobControllers";
const jobRoutes = express.Router();
jobRoutes.post("/request-job", authMiddleware, requestJob);
jobRoutes.get("/get-jobs", authMiddleware, fetchJobs);
jobRoutes.get("/get-job/:id", authMiddleware, fetchJobsId);
jobRoutes.put("/update-job/:id", authMiddleware, updateJob);
jobRoutes.delete("/delete-job/:id", authMiddleware, deleteJob);
export default jobRoutes;
