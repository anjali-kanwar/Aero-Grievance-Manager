import express from "express";
import { getAllNotes } from "../controllers/notesController.js";

const router = express.Router();

router.get("/", getAllNotes);
export default router;