import { ResultLevel } from './openai-service';

export interface AnalysisHistoryItem {
  id: string;
  date: string;
  imageUrl: string; // Base64 or URL of the image
  result: {
    riskLevel: ResultLevel;
    riskScore: number;
    confidence: number;
    findings: string[];
    recommendations: Record<string, string>;
    nextCheckupRecommendation: string;
  };
  method: 'scan' | 'upload';
}

// Key for localStorage
const HISTORY_STORAGE_KEY = 'diabetly_analysis_history';

/**
 * Save analysis result to history
 */
export function saveAnalysisToHistory(
  imageUrl: string,
  result: AnalysisHistoryItem['result'],
  method: 'scan' | 'upload'
): AnalysisHistoryItem {
  // Create history item
  const historyItem: AnalysisHistoryItem = {
    id: generateUniqueId(),
    date: new Date().toISOString(),
    imageUrl,
    result,
    method
  };

  // Get existing history
  const existingHistory = getAnalysisHistory();
  
  // Add new item to the beginning of history
  const updatedHistory = [historyItem, ...existingHistory];
  
  // Save updated history to localStorage
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  
  return historyItem;
}

/**
 * Get all analysis history items
 */
export function getAnalysisHistory(): AnalysisHistoryItem[] {
  try {
    const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY);
    
    if (!historyJson) {
      return [];
    }
    
    return JSON.parse(historyJson);
  } catch (error) {
    console.error('Error retrieving analysis history:', error);
    return [];
  }
}

/**
 * Delete an analysis history item by ID
 */
export function deleteHistoryItem(id: string): boolean {
  try {
    const history = getAnalysisHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Error deleting history item:', error);
    return false;
  }
}

/**
 * Clear all analysis history
 */
export function clearAnalysisHistory(): boolean {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing analysis history:', error);
    return false;
  }
}

/**
 * Generate a unique ID for history items
 */
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
} 