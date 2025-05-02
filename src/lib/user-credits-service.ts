import { supabase } from './supabase';
import { UserSubscription } from './supabase';

// Table name for user credits
const USER_SUBSCRIPTIONS_TABLE = 'user_subscriptions';

// Credit plan costs
export const CREDIT_PLANS = {
  ONE_TIME: {
    name: 'Разовый анализ',
    credits: 1,
    price: 15, // $15 for one analysis
    PriceTG: 7800, 
    description: 'Одноразовый анализ сетчатки глаза с помощью ИИ',
    features: [
      'Полный анализ снимка сетчатки',
      'Подробный отчет',
      'AI-консультация',
      'Возможность скачать отчет',
    ]
  },
  FAMILY: {
    name: 'Семейный план',
    credits: 5,
    price: 50, // $50 for 5 analyses (discount)
    PriceTG: 25800,
    description: 'Пять анализов сетчатки глаза для всей семьи',
    features: [
      'Все функции разового анализа',
      'Скидка 33% на каждый анализ',
      '5 кредитов для использования',
      'Неограниченный доступ к истории анализов'
    ]
  }
};

/**
 * Get user subscription information
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase
      .from(USER_SUBSCRIPTIONS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }

    // Return the first subscription if found, otherwise null
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

/**
 * Create a new subscription for user
 */
export async function createUserSubscription(
  userId: string,
  planType: 'one_time' | 'family',
): Promise<UserSubscription | null> {
  try {
    // Determine credits based on plan
    const credits = planType === 'one_time' 
      ? CREDIT_PLANS.ONE_TIME.credits 
      : CREDIT_PLANS.FAMILY.credits;

    const subscriptionData = {
      user_id: userId,
      plan_type: planType,
      credits_remaining: credits,
      active: true,
    };

    const { data, error } = await supabase
      .from(USER_SUBSCRIPTIONS_TABLE)
      .insert(subscriptionData)
      .select();

    if (error) {
      console.error('Error creating user subscription:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error creating user subscription:', error);
    return null;
  }
}

/**
 * Use one credit for analysis
 * Returns true if credit was successfully used
 */
export async function useCredit(userId: string): Promise<boolean> {
  try {
    // Get current subscription
    const subscription = await getUserSubscription(userId);
    
    if (!subscription || subscription.credits_remaining < 1) {
      return false;
    }

    // Update credits
    const { error } = await supabase
      .from(USER_SUBSCRIPTIONS_TABLE)
      .update({ 
        credits_remaining: subscription.credits_remaining - 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error using credit:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error using credit:', error);
    return false;
  }
}

/**
 * Check if user has enough credits for analysis
 */
export async function hasCredits(userId: string): Promise<boolean> {
  try {
    console.log('Checking credits for user:', userId);
    const subscription = await getUserSubscription(userId);
    
    if (!subscription) {
      console.log('No active subscription found for user:', userId);
      return false;
    }
    
    console.log('User has subscription with credits:', subscription.credits_remaining);
    return subscription.credits_remaining > 0;
  } catch (error) {
    console.error('Error checking if user has credits:', error);
    return false;
  }
}

/**
 * Get remaining credits for a user
 */
export async function getRemainingCredits(userId: string): Promise<number> {
  const subscription = await getUserSubscription(userId);
  return subscription ? subscription.credits_remaining : 0;
} 