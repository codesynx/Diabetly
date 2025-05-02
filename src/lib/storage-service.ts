import { AnalysisResult } from './api-service';
import { 
  saveAnalysisToSupabase, 
  getUserAnalysisHistory as getSupabaseHistory, 
  deleteSupabaseHistoryItem, 
  clearUserAnalysisHistory,
  clearAnalysisHistoryCache
} from './supabase-storage-service';

export interface AnalysisHistoryItem {
  id: string;               // Client-side unique ID
  userId: string;           // User ID for filtering
  date: string;             // Date of analysis (ISO format)
  imageUrl: string;         // Base64 or URL of the image
  result: AnalysisResult;   // Analysis result from the API
  method: 'scan' | 'upload'; // Method used for analysis
  analysis_id: string;      // Server-side analysis ID for API operations
}

// Helper function to generate a unique ID for new items
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get localStorage key for a specific user
function getStorageKey(userId?: string): string {
  return `diabetly-analysis-history-${userId || 'anonymous'}`;
}

/**
 * Save analysis result to history - prioritize Supabase for logged-in users
 */
export async function saveAnalysisToHistory(
  imageUrl: string,
  result: AnalysisResult,
  method: 'scan' | 'upload',
  userId?: string
): Promise<AnalysisHistoryItem> {
  // Create history item
  const historyItem: AnalysisHistoryItem = {
    id: generateUniqueId(),
    userId: userId || 'anonymous',
    date: new Date().toISOString(),
    imageUrl,
    result,
    method,
    analysis_id: result.analysis_id // Save the server-side analysis ID for API operations
  };
  
  try {
    // If user is logged in, save to Supabase first
    if (userId) {
      const supabaseItem = await saveAnalysisToSupabase(imageUrl, result, method, userId);
      if (supabaseItem) {
        // Successfully saved to Supabase, return the server-generated item
        return supabaseItem;
      }
    }

    // Save to localStorage as fallback or for anonymous users
    // Get existing history from localStorage
    const storageKey = getStorageKey(userId);
    let existingHistory: AnalysisHistoryItem[] = [];
    
    try {
      const historyJson = localStorage.getItem(storageKey);
      if (historyJson) {
        existingHistory = JSON.parse(historyJson);
      }
    } catch (error) {
      console.error('Error parsing localStorage history:', error);
    }
    
    // Add new item to the beginning of history
    const updatedHistory = [historyItem, ...existingHistory];
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving analysis history:', error);
  }
  
  return historyItem;
}

/**
 * Get all analysis history items - prioritize Supabase for logged-in users
 */
export async function getAnalysisHistory(userId?: string): Promise<AnalysisHistoryItem[]> {
  // If user is logged in, get history from Supabase
  if (userId) {
    try {
      const supabaseHistory = await getSupabaseHistory(userId);
      if (supabaseHistory && supabaseHistory.length > 0) {
        return supabaseHistory;
      }
    } catch (error) {
      console.error('Error retrieving history from Supabase, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage for anonymous users or if Supabase failed
  try {
    const storageKey = getStorageKey(userId);
    const historyJson = localStorage.getItem(storageKey);
    
    if (!historyJson) {
      return [];
    }
    
    const history = JSON.parse(historyJson);
    
    // If user ID is provided, filter by user ID
    if (userId) {
      return history.filter((item: AnalysisHistoryItem) => 
        item.userId === userId || item.userId === 'anonymous');
    }
    
    return history;
  } catch (error) {
    console.error('Error retrieving analysis history from localStorage:', error);
    return [];
  }
}

/**
 * Delete a specific history item
 */
export async function deleteHistoryItem(itemId: string, userId?: string): Promise<boolean> {
  try {
    // If user is logged in, delete from Supabase first
    if (userId) {
      await deleteSupabaseHistoryItem(itemId, userId);
    }
    
    // Always update localStorage as well for consistency
    try {
      const history = await getAnalysisHistory(userId);
      const updatedHistory = history.filter(item => item.id !== itemId);
      localStorage.setItem(getStorageKey(userId), JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error updating localStorage after delete:', error);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting history item:', error);
    return false;
  }
}

/**
 * Clear all analysis history
 */
export async function clearAnalysisHistory(userId?: string): Promise<boolean> {
  try {
    // Clear from Supabase if user is logged in
    if (userId) {
      await clearUserAnalysisHistory(userId);
    }
    
    // Also clear from localStorage
    localStorage.removeItem(getStorageKey(userId));
    return true;
  } catch (error) {
    console.error('Error clearing analysis history:', error);
    return false;
  }
}

/**
 * Get a specific history item by ID
 */
export async function getHistoryItemById(id: string, userId?: string): Promise<AnalysisHistoryItem | null> {
  try {
    const history = await getAnalysisHistory(userId);
    return history.find(item => item.id === id) || null;
  } catch (error) {
    console.error('Error finding history item:', error);
    return null;
  }
}

/**
 * Get a history item by server-side analysis ID
 */
export async function getHistoryItemByAnalysisId(analysisId: string, userId?: string): Promise<AnalysisHistoryItem | null> {
  try {
    const history = await getAnalysisHistory(userId);
    return history.find(item => item.analysis_id === analysisId) || null;
  } catch (error) {
    console.error('Error finding history item by analysis ID:', error);
    return null;
  }
}

/**
 * Clear all user-related data from localStorage upon signout
 */
export function clearUserData(userId?: string): void {
  if (!userId) return;
  
  // Clear caches
  clearAnalysisHistoryCache(userId);
  
  // Clear localStorage data
  localStorage.removeItem(getStorageKey(userId));
  localStorage.removeItem(`diabetly-chat-sessions-${userId}`);
  sessionStorage.removeItem(`chat_sessions_${userId}`);
  sessionStorage.removeItem(`analysis_history_${userId}`);
} 