const express = require("express");
const router = express.Router();
const {
  addTransaction,
  getPortfolio,
  deleteTransaction,
} = require("../controllers/portfolioController");
const authenticateToken = require("../middleware/auth");

// All portfolio routes are protected with JWT
router.use(authenticateToken);

router.route("/")
  .get(getPortfolio)
  .post(addTransaction);

router.route("/:id")
  .delete(deleteTransaction);

module.exports = router;
