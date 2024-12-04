const express = require("express");
const { initiatePayment, handleRedirect } = require("../controllers/paymentController");

const router = express.Router();

router.get("/pay", initiatePayment);
router.get("/redirect/:transactionId", handleRedirect);

module.exports = router;
