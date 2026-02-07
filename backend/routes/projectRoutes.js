const express = require("express");
const router = express.Router();

const {
  evaluateProject,
  getEvaluationHistory,
  deleteEvaluation
} = require("../controllers/projectController");

router.post("/evaluate", evaluateProject);
router.get("/history", getEvaluationHistory);
router.delete("/:id", deleteEvaluation);

module.exports = router;
