export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { otp } = req.body;
  
      // Here you would check the OTP, possibly by matching it with a stored value or using a service
      if (otp === '123456') { // Example OTP
        res.status(200).json({ message: 'OTP verified successfully' });
      } else {
        res.status(400).json({ error: 'Invalid OTP' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  }
  