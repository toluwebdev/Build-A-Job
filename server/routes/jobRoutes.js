import express from "express";
const jobRoutes = express.Router();
jobRoutes.post("/request-job", authMiddleware, requestJob);
jobRoutes.get("/get-jobs", authMiddleware, getJobs);
jobRoutes.get("/get-job/:id", authMiddleware, getJob);
jobRoutes.put("/update-job/:id", authMiddleware, updateJob);
jobRoutes.delete("/delete-job/:id", authMiddleware, deleteJob);
export default jobRoutes;
