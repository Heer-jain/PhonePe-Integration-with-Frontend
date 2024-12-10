exports.submitAuthRequest = async (req, res) => {

    const { amount, merchantUserId, subscriptionId, authRequestId } = req.body;

    if (!amount || !merchantUserId || !subscriptionId || !authRequestId) {
        return res.status(400).json({ success: false, message: 'Missing required field' });
    }

  try {
    const payload = {
      merchantId: process.env.MERCHANT_ID,
      merchantUserId: merchantUserId,
      subscriptionId: subscriptionId,
      authRequestId: authRequestId,
      amount: amount,
      paymentInstrument: {
        type: "UPI_QR"
      },
    }

    const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
    const base64Payload = bufferObj.toString("base64");

    const hash = crypto.createHash('sha256')
      .update(base64Payload + payEndPoint + SALT_KEY)
      .digest('hex');
    const xVerify = `${hash}###${SALT_INDEX}`;

    console.log("payload", payload)
    console.log("base64Payload", base64Payload)
    console.log("xVerify", xVerify)

    const options = {
      method: 'post',
      url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/v3/recurring/auth/init',
      headers: {
        accept: 'text/plain',
        'Content-Type': 'application/json',
      },
      data: { 
         base64Payload }
    };

    const response = await axios.request(options);
    console.log('Response:', response.data);
    res.status(200).send(response.data);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send('Internal Server Error');
    }
  }
};
