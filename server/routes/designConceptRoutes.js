import express from "express";
import authMiddleware from "../middleware/authMiddleWare.js";
import {
  analyzeDesignConcept,
  createDesignConcept,
  getDesignConceptById,
} from "../controllers/designConceptController.js";

const designConceptRoutes = express.Router();

designConceptRoutes.post("/analyze", authMiddleware, analyzeDesignConcept);
designConceptRoutes.post("/", authMiddleware, createDesignConcept);
designConceptRoutes.get("/:id", authMiddleware, getDesignConceptById);

export default designConceptRoutes;
