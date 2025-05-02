import { supabase } from './supabase';
import { AnalysisHistoryItem } from './storage-service';
import { AnalysisResult } from './api-service';

// Table name for analysis history
const ANALYSIS_HISTORY_TABLE = 'analysis_history';

/**
 * Save analysis result to Supabase database
 */
export async function saveAnalysisToSupabase(
  imageUrl: string,
  result: AnalysisResult,
  method: 'scan' | 'upload',
  userId: string
): Promise<AnalysisHistoryItem | null> {
  try {
    // Create history item for Supabase using correct field names
    const historyItem = {
      user_id: userId,
      date: new Date().toISOString(),
      image_url: imageUrl, // Changed from imageUrl to image_url to match DB schema
      result: result,
      method: method,
      analysis_id: result.analysis_id
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from(ANALYSIS_HISTORY_TABLE)
      .insert(historyItem)
      .select()
      .single();

    if (error) {
      console.error('Error saving analysis to Supabase:', error);
      return null;
    }

    // Clear the cache to ensure fresh data on next load
    clearAnalysisHistoryCache(userId);

    // Return the item with id from Supabase, mapped to application format
    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      imageUrl: data.image_url, // Convert from DB field to app field
      result: data.result,
      method: data.method,
      analysis_id: data.analysis_id
    };
  } catch (error) {
    console.error('Error saving analysis to Supabase:', error);
    return null;
  }
}

/**
 * Get all analysis history items for a user with caching for better performance
 */
export async function getUserAnalysisHistory(userId: string): Promise<AnalysisHistoryItem[]> {
  try {
    // Use cached data if available (for 5 seconds)
    const cacheKey = `analysis_history_${userId}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { timestamp, data } = JSON.parse(cachedData);
      // Use cache if it's less than 5 seconds old
      if (Date.now() - timestamp < 5000) {
        return data;
      }
    }

    // Only select necessary fields for better performance
    const { data, error } = await supabase
      .from(ANALYSIS_HISTORY_TABLE)
      .select('id, user_id, date, image_url, result, method, analysis_id')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error retrieving analysis history from Supabase:', error);
      return [];
    }

    // Map from DB structure to application structure
    const formattedData = data.map((item) => ({
      id: item.id,
      userId: item.user_id,
      date: item.date,
      imageUrl: item.image_url, // Convert from DB field to app field
      result: item.result,
      method: item.method,
      analysis_id: item.analysis_id
    }));
    
    // Cache the result for fast access
    sessionStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      data: formattedData
    }));

    return formattedData;
  } catch (error) {
    console.error('Error retrieving analysis history from Supabase:', error);
    return [];
  }
}

/**
 * Clear the analysis history cache for a user
 */
export function clearAnalysisHistoryCache(userId: string): void {
  const cacheKey = `analysis_history_${userId}`;
  sessionStorage.removeItem(cacheKey);
}

/**
 * Delete a specific history item
 */
export async function deleteSupabaseHistoryItem(itemId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(ANALYSIS_HISTORY_TABLE)
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting analysis history item from Supabase:', error);
      return false;
    }

    // Clear the cache to ensure fresh data on next load
    clearAnalysisHistoryCache(userId);

    return true;
  } catch (error) {
    console.error('Error deleting analysis history item from Supabase:', error);
    return false;
  }
}

/**
 * Clear all analysis history for a user
 */
export async function clearUserAnalysisHistory(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(ANALYSIS_HISTORY_TABLE)
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing analysis history from Supabase:', error);
      return false;
    }

    // Clear the cache to ensure fresh data on next load
    clearAnalysisHistoryCache(userId);

    return true;
  } catch (error) {
    console.error('Error clearing analysis history from Supabase:', error);
    return false;
  }
}

/**
 * Get a specific history item by ID with caching
 */
export async function getSupabaseHistoryItemById(id: string, userId: string): Promise<AnalysisHistoryItem | null> {
  try {
    // Check if we have this item in the cache
    const cacheKey = `analysis_history_${userId}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data } = JSON.parse(cachedData);
      const cachedItem = data.find((item: AnalysisHistoryItem) => item.id === id);
      if (cachedItem) {
        return cachedItem;
      }
    }

    const { data, error } = await supabase
      .from(ANALYSIS_HISTORY_TABLE)
      .select('id, user_id, date, image_url, result, method, analysis_id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Error finding history item in Supabase:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      imageUrl: data.image_url,
      result: data.result,
      method: data.method,
      analysis_id: data.analysis_id
    };
  } catch (error) {
    console.error('Error finding history item in Supabase:', error);
    return null;
  }
}

/**
 * Get a history item by server-side analysis ID with caching
 */
export async function getSupabaseHistoryItemByAnalysisId(analysisId: string, userId: string): Promise<AnalysisHistoryItem | null> {
  try {
    // Check if we have this item in the cache
    const cacheKey = `analysis_history_${userId}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data } = JSON.parse(cachedData);
      const cachedItem = data.find((item: AnalysisHistoryItem) => item.analysis_id === analysisId);
      if (cachedItem) {
        return cachedItem;
      }
    }

    const { data, error } = await supabase
      .from(ANALYSIS_HISTORY_TABLE)
      .select('id, user_id, date, image_url, result, method, analysis_id')
      .eq('analysis_id', analysisId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Error finding history item by analysis ID in Supabase:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      imageUrl: data.image_url,
      result: data.result,
      method: data.method,
      analysis_id: data.analysis_id
    };
  } catch (error) {
    console.error('Error finding history item by analysis ID in Supabase:', error);
    return null;
  }
} 