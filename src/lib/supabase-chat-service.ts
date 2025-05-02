import { supabase } from './supabase';

// Table name for chat sessions
const CHAT_SESSIONS_TABLE = 'chat_sessions';

// Interface for chat message
export interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
  timestamp: string; // ISO string format
}

// Interface for mentioned analysis
export interface MentionedAnalysis {
  id: string;
  date: string;
  analysis_id: string;
  displayText: string;
}

// Interface for chat session
export interface ChatSession {
  id: string;            // Client-side chat ID
  title: string;
  messages: ChatMessage[];
  mentionedAnalysis: MentionedAnalysis | null;
}

// Interface for chat session as stored in database
interface DbChatSession {
  id: string;            // Server UUID
  user_id: string;
  chat_id: string;       // Client-side chat ID
  title: string;
  messages: ChatMessage[];
  mentioned_analysis: MentionedAnalysis | null;
  created_at: string;
  updated_at: string;
}

/**
 * Save chat sessions to Supabase - optimized version
 * Uses upsert instead of delete-then-insert to improve performance
 */
export async function saveChatSessionsToSupabase(
  chatSessions: ChatSession[],
  userId: string
): Promise<boolean> {
  try {
    if (chatSessions.length === 0) {
      return true; // No sessions to save
    }

    // Map application fields to database fields
    const sessionsToUpsert = chatSessions.map(session => ({
      user_id: userId,
      chat_id: session.id,
      title: session.title,
      messages: session.messages,
      mentioned_analysis: session.mentionedAnalysis, // Field name must match DB column name
      updated_at: new Date().toISOString()
    }));

    // Use upsert instead of delete-then-insert for better performance
    const { error } = await supabase
      .from(CHAT_SESSIONS_TABLE)
      .upsert(sessionsToUpsert, { 
        onConflict: 'user_id,chat_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error upserting chat sessions:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving chat sessions to Supabase:', error);
    return false;
  }
}

/**
 * Load chat sessions from Supabase - optimized for performance
 */
export async function loadChatSessionsFromSupabase(userId: string): Promise<ChatSession[]> {
  try {
    // Use a cached value if available (for 5 seconds)
    const cacheKey = `chat_sessions_${userId}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { timestamp, data } = JSON.parse(cachedData);
      // Use cache if it's less than 5 seconds old
      if (Date.now() - timestamp < 5000) {
        return data;
      }
    }

    const { data, error } = await supabase
      .from(CHAT_SESSIONS_TABLE)
      .select('chat_id, title, messages, mentioned_analysis, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error retrieving chat sessions from Supabase:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Map database format to application format
    const formattedData = data.map(item => ({
      id: item.chat_id,
      title: item.title,
      messages: item.messages,
      mentionedAnalysis: item.mentioned_analysis // Convert DB field to app field
    }));
    
    // Cache the result for fast access
    sessionStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      data: formattedData
    }));

    return formattedData;
  } catch (error) {
    console.error('Error retrieving chat sessions from Supabase:', error);
    return [];
  }
}

/**
 * Save a single chat session to Supabase
 * This is faster than saving all sessions when only updating one
 */
export async function saveSingleChatSessionToSupabase(
  chatSession: ChatSession,
  userId: string
): Promise<boolean> {
  try {
    const sessionToUpsert = {
      user_id: userId,
      chat_id: chatSession.id,
      title: chatSession.title,
      messages: chatSession.messages,
      mentioned_analysis: chatSession.mentionedAnalysis,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from(CHAT_SESSIONS_TABLE)
      .upsert(sessionToUpsert, { 
        onConflict: 'user_id,chat_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error upserting single chat session:', error);
      return false;
    }

    // Clear the cache to ensure fresh data on next load
    const cacheKey = `chat_sessions_${userId}`;
    sessionStorage.removeItem(cacheKey);

    return true;
  } catch (error) {
    console.error('Error saving chat session to Supabase:', error);
    return false;
  }
}

/**
 * Delete a chat session from Supabase
 */
export async function deleteSupabaseChatSession(
  chatId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(CHAT_SESSIONS_TABLE)
      .delete()
      .eq('user_id', userId)
      .eq('chat_id', chatId);

    if (error) {
      console.error('Error deleting chat session:', error);
      return false;
    }

    // Clear the cache to ensure fresh data on next load
    const cacheKey = `chat_sessions_${userId}`;
    sessionStorage.removeItem(cacheKey);

    return true;
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return false;
  }
}

/**
 * Clear all chat sessions for a user
 */
export async function clearUserChatSessions(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(CHAT_SESSIONS_TABLE)
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing chat sessions:', error);
      return false;
    }

    // Clear the cache to ensure fresh data on next load
    const cacheKey = `chat_sessions_${userId}`;
    sessionStorage.removeItem(cacheKey);

    return true;
  } catch (error) {
    console.error('Error clearing chat sessions:', error);
    return false;
  }
} 