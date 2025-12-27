const axios = require('axios');

exports.verifyEsewa = async ({ amt, refId }) => {
  const response = await axios.post(
    'https://uat.esewa.com.np/epay/transrec',
    null,
    {
      params: {
        amt,
        rid: refId,
        pid: process.env.ESEWA_PID,
        scd: process.env.ESEWA_SCD
      }
    }
  );

  return response.data.includes('Success');
};

exports.verifyKhalti = async ({ token, amount }) => {
  const response = await axios.post(
    'https://khalti.com/api/v2/payment/verify/',
    { token, amount },
    {
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`
      }
    }
  );

  return response.data.state?.name === 'Completed';
};
