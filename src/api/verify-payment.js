// This file would be in a server environment in production
// For development, you might use a serverless function or a separate backend

import Stripe from 'stripe';
import { createUserSubscription } from '../lib/user-credits-service';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'Missing session ID' });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Check if payment was successful
    if (session.payment_status === 'paid') {
      const { userId, planType, credits } = session.metadata;

      // Create user subscription in Supabase
      const subscription = await createUserSubscription(userId, planType);

      if (!subscription) {
        // Payment was successful but subscription creation failed
        // In a real app, you would need error handling and notification to admins
        console.error('Failed to create subscription after successful payment');
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to create subscription after successful payment' 
        });
      }

      return res.status(200).json({ success: true, subscription });
    } else {
      return res.status(400).json({ success: false, error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ success: false, error: 'Failed to verify payment' });
  }
}

// Note: In a real production environment, this would be implemented
// as a serverless function (e.g., Vercel, AWS Lambda) or in a backend API.
// Additionally, you would typically use Stripe webhooks for a more reliable approach. 