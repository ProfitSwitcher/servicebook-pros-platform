const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, businessType } = req.body;

  const msg = {
    to: process.env.DEMO_NOTIFICATION_EMAIL,
    from: 'no-reply@servicebookpros.com',
    subject: `New demo request from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nBusiness type: ${businessType}`,
    html: `<h1>New demo request</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Business type:</strong> ${businessType}</p>`
  };

  try {
    await sgMail.send(msg);
    await twilioClient.messages.create({
      body: `Demo request: ${name}, ${phone}, ${businessType}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+15555555555'
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to send notifications' });
  }
};
