import { loadStripe } from '@stripe/stripe-js';
import { CREDIT_PLANS } from './user-credits-service';
import { supabase } from './supabase';

// Initialize Stripe with public key from environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

// Define payment types and interfaces
export interface PaymentSession {
  id: string;
  url: string;
}

export interface CheckoutOptions {
  planType: 'one_time' | 'family';
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  userId: string;
}

/**
 * Create a Stripe Checkout session for purchasing credits
 */
export async function createCheckoutSession(options: CheckoutOptions): Promise<PaymentSession | null> {
  try {
    const { planType, successUrl, cancelUrl, customerEmail, userId } = options;
    
    // Determine price based on plan type
    const plan = planType === 'one_time' ? CREDIT_PLANS.ONE_TIME : CREDIT_PLANS.FAMILY;
    
    // Create checkout session by directly calling Stripe API
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}`,
      },
      body: new URLSearchParams({
        'success_url': successUrl,
        'cancel_url': cancelUrl,
        'mode': 'payment',
        'payment_method_types[0]': 'card',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][unit_amount]': (plan.price * 100).toString(), // Stripe takes amounts in cents
        'line_items[0][price_data][product_data][name]': plan.name,
        'line_items[0][price_data][product_data][description]': plan.description,
        'line_items[0][quantity]': '1',
        'metadata[userId]': userId,
        'metadata[planType]': planType,
        'metadata[credits]': plan.credits.toString(),
        'customer_email': customerEmail || '',
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }
    
    const session = await response.json();
    return {
      id: session.id,
      url: session.url
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return null;
  }
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(sessionId: string): Promise<void> {
  try {
    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }
    
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });
    
    if (error) {
      console.error('Error redirecting to checkout:', error);
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
  }
}

/**
 * Verify a payment was successful using the session ID from URL
 */
export async function verifyPayment(sessionId: string): Promise<boolean> {
  try {
    // Directly call Stripe API to check session status
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}`,
      },
    });
    
    if (!response.ok) {
      return false;
    }
    
    const session = await response.json();
    const isSuccessful = session.payment_status === 'paid';
    
    // If payment is successful, add credits to the user account
    if (isSuccessful && session.metadata?.userId && session.metadata?.planType) {
      await addCreditsToUser(
        session.metadata.userId,
        session.metadata.planType,
        parseInt(session.metadata.credits || '0')
      );
    }
    
    return isSuccessful;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
}

/**
 * Add credits to user account after successful payment
 */
async function addCreditsToUser(
  userId: string,
  planType: 'one_time' | 'family',
  credits: number
): Promise<boolean> {
  try {
    // Check if user has an active subscription
    const { data: subscriptions, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (fetchError) {
      console.error('Error fetching subscription:', fetchError);
      return false;
    }
    
    // Get the first subscription if it exists
    const existingSubscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;
    
    if (existingSubscription) {
      // Update existing subscription with both credits and plan type
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          plan_type: planType,
          credits_remaining: existingSubscription.credits_remaining + credits,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id);
        
      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return false;
      }
      return true;
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_type: planType,
          credits_remaining: credits,
          active: true
        });
        
      if (insertError) {
        console.error('Error creating subscription:', insertError);
        
        // If insert fails because of unique constraint violation, try to fetch active subscription again
        // (could happen due to race condition or if another process created it)
        if (insertError.code === '23505' || insertError.message?.includes('duplicate key value')) {
          console.log('Unique constraint violated, attempting to update existing subscription instead');
          
          // Fetch the current active subscription
          const { data: retrySubscriptions, error: retryFetchError } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('active', true)
            .single();
          
          if (retryFetchError) {
            console.error('Error fetching subscription on retry:', retryFetchError);
            return false;
          }
          
          // Update existing subscription with both credits and plan type
          if (retrySubscriptions) {
            const { error: retryUpdateError } = await supabase
              .from('user_subscriptions')
              .update({
                plan_type: planType,
                credits_remaining: retrySubscriptions.credits_remaining + credits,
                updated_at: new Date().toISOString()
              })
              .eq('id', retrySubscriptions.id);
              
            if (retryUpdateError) {
              console.error('Error updating subscription on retry:', retryUpdateError);
              return false;
            }
            
            return true;
          }
        }
        
        return false;
      }
      return true;
    }
  } catch (error) {
    console.error('Error adding credits to user:', error);
    return false;
  }
} 