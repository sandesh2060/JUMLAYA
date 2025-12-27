const axios = require("axios");

exports.initiateEsewaPayment = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Amount and Order ID are required" });
    }

    // Build Esewa payment request URL
    const paymentFormUrl = "https://uat.esewa.com.np/epay/main";

    const formData = {
      amt: amount,
      psc: 0,
      pdc: 0,
      txAmt: 0,
      tAmt: amount,
      pid: orderId,
      scd: "EPAYTEST",
      su: "http://localhost:4001/api/esewa/payment-success",
      fu: "http://localhost:4001/api/esewa/payment-failed",
    };

    return res.status(200).json({
      success: true,
      paymentUrl: paymentFormUrl,
      formData,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.verifyEsewaPayment = async (req, res) => {
  try {
    const { oid, amt, refId } = req.query;

    const payload = {
      amt: amt,
      rid: refId,
      pid: oid,
      scd: "EPAYTEST",
    };

    const response = await axios.post(
      "https://uat.esewa.com.np/epay/transrec",
      payload,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (response.data.includes("Success")) {
      // TODO: Mark order as paid in DB

      return res.status(200).json({
        success: true,
        message: "Payment verified",
        orderId: oid,
        refId,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Payment verification failed",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.paymentFailed = (req, res) => {
  return res.status(400).json({
    success: false,
    message: "Payment failed",
  });
};
