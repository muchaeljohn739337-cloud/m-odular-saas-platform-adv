import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret for security
  const authHeader = req.headers.authorization;
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedAuth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Your cron job logic here
    console.log('Cron job executed at:', new Date().toISOString());

    // Example: Call backend API to perform maintenance tasks
    // You can add any scheduled tasks here

    res.status(200).json({
      message: 'Hello Cron!',
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    console.error('Cron job error:', error);
    res.status(500).json({
      error: 'Cron job failed',
      timestamp: new Date().toISOString()
    });
  }
}