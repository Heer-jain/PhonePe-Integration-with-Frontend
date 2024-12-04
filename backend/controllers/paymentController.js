const axios = require("axios");
const sha256 = require("sha256");
const uniqid = require("uniqid");
const UserPayment = require("../models/UserPayment");

// const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
// const MERCHANT_ID = process.env.MERCHENT_ID;
// const SALT_KEY = process.env.SALT_KEY;
// const SALT_INDEX = process.env.SALT_INDEX;

const MERCHANT_ID = "PGTESTPAYUAT86"
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox"
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076"
const SALT_INDEX = 1

exports.initiatePayment = async (req, res) => {
  try {
    const { userId, mobileNumber } = req.body;
    const payEndPoint = "/pg/v1/pay";
    const transactionId = uniqid();

    const redirectUrl = `http://localhost:3000/api/payment/redirect/${transactionId}`;

    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: 123,
      amount: 13900, // ₹139 in paise
      redirectUrl: redirectUrl,
      redirectMode: "REDIRECT",
      mobileNumber: "123",
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
    const base64Payload = bufferObj.toString("base64");

    const hash = sha256(base64Payload + payEndPoint + SALT_KEY);
    const xVerify = `${hash}###${SALT_INDEX}`;

    const options = {
      method: "post",
      url: `${PHONE_PE_HOST_URL}${payEndPoint}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      data: { request: base64Payload },
    };

    // const response = await axios.request(options);
    // const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        const url = response.data.data.instrumentResponse.redirectInfo.url;
        res.redirect(url);
          // res.send(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });

    await UserPayment.create({
      userId,
      mobileNumber,
      transactionId,
      status: "pending",
      nextPaymentDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // res.status(200).send({ url: redirectUrl });
    return res.status(200).json({ url: response.data.data.instrumentResponse.redirectInfo.url });

  } catch (error) {
    console.error("Payment initiation error:", error);
    // res.status(500).send({ error: "Payment initiation failed." });
    if (!res.headersSent) {
      return res.status(500).json({ message: "Payment initiation failed", error });
    }
  }
};

exports.handleRedirect = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${transactionId}` + SALT_KEY) + "###" + SALT_INDEX;

    const options = {
      method: "get",
      url: `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${transactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-MERCHANT-ID": transactionId,
        "X-VERIFY": xVerify,
      },
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        if (response.data.code === "PAYMENT_SUCCESS") {
          const today = new Date();
          const nextPaymentDate = new Date(today);
          nextPaymentDate.setDate(today.getDate() + 1);
          UserPayment.findOneAndUpdate(
            { transactionId },
            {
              status: "active",
              lastPaymentDate: today,
              nextPaymentDate,
            }
          );
          res.redirect("http://localhost:3000/success");
        } else if (response.data.code === "PAYMENT_ERROR") {
          UserPayment.findOneAndUpdate({ transactionId }, { status: "failed" });
          res.redirect("http://localhost:3000/error");
        } else {
          res.redirect("http://localhost:3000/pending");
        }
        res.send(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });

    // const response = await axios.request(options);
    // const { code } = response.data;

    // if (code === "PAYMENT_SUCCESS") {
    //   const today = new Date();
    //   const nextPaymentDate = new Date(today);
    //   nextPaymentDate.setDate(today.getDate() + 1);

    //   await UserPayment.findOneAndUpdate(
    //     { transactionId },
    //     {
    //       status: "active",
    //       lastPaymentDate: today,
    //       nextPaymentDate,
    //     }
    //   );
    //   res.redirect("http://localhost:3000/success");
    // } else if (code === "PAYMENT_ERROR") {
    //   await UserPayment.findOneAndUpdate({ transactionId }, { status: "failed" });
    //   res.redirect("http://localhost:3000/error");
    // } else {
    //   res.redirect("http://localhost:3000/pending");
    // }
  } catch (error) {
    console.error("Payment status check error:", error);
    res.status(500).send({ error: "Failed to check payment status." });
  }
};

exports.processRecurringPayments = async () => {
  try {
    const currentDate = new Date();
    const eligibleUsers = await UserPayment.find({
      nextPaymentDate: { $lte: currentDate },
      status: "ACTIVE",
    });

    for (const user of eligibleUsers) {
      const payload = {
        merchantId: MERCHANT_ID,
        merchantTransactionId: uniqid(),
        merchantUserId: 123,
        amount: 13900,
        redirectMode: "NONE",
        mobileNumber: "123",
        paymentInstrument: {
          type: "PAY_PAGE",
        },
      };

      const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
      const base64EncodedPayload = bufferObj.toString("base64");
      const payEndpoint = "/pg/v1/pay";
      const hash = sha256(base64EncodedPayload + payEndpoint + process.env.SALT_KEY);
      const xVerify = `${hash}###${process.env.SALT_INDEX}`;

      const options = {
        method: "post",
        url: `${process.env.PHONE_PE_HOST_URL}${payEndpoint}`,
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
        },
        data: {
          request: base64EncodedPayload,
        },
      };

      const response = await axios.request(options);

      if (response.data.success) {
        user.lastPaymentDate = new Date();
        user.nextPaymentDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();
        console.log(`Payment processed for user ${user.userId}`);
      } else {
        console.error(`Payment failed for user ${user.userId}:`, response.data);
      }
    }
  } catch (error) {
    console.error("Error in processRecurringPayments:", error);
  }
};
