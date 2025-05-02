import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Info, Plus, X, ArrowDown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAnalysisHistory, AnalysisHistoryItem } from '@/lib/storage-service';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageLoading } from '@/components/MessageLoading';
import { Button } from '@/components/ui/button';
import { MentionBadge } from '@/components/MentionBadge';
import { ChatInput, ChatInputTextArea, ChatInputSubmit } from '@/components/ChatInput';
import { TextShimmerQuestion, TextShimmerTip } from '@/components/TextShimmerDemo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { 
  ChatMessage as SupabaseChatMessage, 
  MentionedAnalysis as SupabaseMentionedAnalysis, 
  ChatSession as SupabaseChatSession, 
  loadChatSessionsFromSupabase, 
  saveChatSessionsToSupabase,
  saveSingleChatSessionToSupabase,
  deleteSupabaseChatSession
} from '@/lib/supabase-chat-service';

interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface MentionedAnalysis {
  id: string;
  date: string;
  analysis_id: string;
  displayText: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  mentionedAnalysis: MentionedAnalysis | null;
}

// Function to convert local ChatSession to Supabase format
const convertToSupabaseFormat = (chatSessions: ChatSession[]): SupabaseChatSession[] => {
  return chatSessions.map(session => ({
    ...session,
    messages: session.messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }))
  }));
};

// Function to convert Supabase ChatSession to local format
const convertFromSupabaseFormat = (chatSessions: SupabaseChatSession[]): ChatSession[] => {
  return chatSessions.map(session => ({
    ...session,
    messages: session.messages.map((msg: SupabaseChatMessage) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))
  }));
};

const Chat = () => {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  const [consultationQuestion, setConsultationQuestion] = useState('');
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoadingChatSessions, setIsLoadingChatSessions] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get the current active chat
  const activeChat = activeChatId 
    ? chatSessions.find(chat => chat.id === activeChatId) 
    : null;

  // Load history and chat sessions - optimized for performance
  useEffect(() => {
    const initializeData = async () => {
      setIsLoadingChatSessions(true);
      
      try {
        // Load history data in parallel with chat sessions
        const historyPromise = loadHistory();
        
        // Only load chat sessions if user is logged in
        let sessionsPromise;
        if (user?.id) {
          sessionsPromise = loadChatSessionsFromSupabase(user.id)
            .then(sessions => {
              if (sessions.length > 0) {
                const formattedSessions = convertFromSupabaseFormat(sessions);
                setChatSessions(formattedSessions);
                setActiveChatId(formattedSessions[0].id);
                return formattedSessions;
              }
              return null;
            });
        }
        
        // Wait for history to load
        await historyPromise;
        
        // Wait for sessions if user is logged in
        if (user?.id && sessionsPromise) {
          const sessions = await sessionsPromise;
          if (!sessions || sessions.length === 0) {
            createNewChat();
          }
        } else {
          // Create a new chat for non-logged in users
          createNewChat();
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        createNewChat();
      } finally {
        setIsLoadingChatSessions(false);
      }
    };
    
    initializeData();
  }, [user?.id]);

  // Save chat sessions - optimized to only save when needed
  useEffect(() => {
    let isSaving = false;
    
    const saveActiveChatSession = async () => {
      if (isSaving || isLoadingChatSessions || !activeChatId) return;
      
      const activeChat = chatSessions.find(chat => chat.id === activeChatId);
      if (!activeChat) return;
      
      isSaving = true;
      
      try {
        if (user?.id) {
          // Save only the active chat session to Supabase for better performance
          const supabaseSession = convertToSupabaseFormat([activeChat])[0];
          await saveSingleChatSessionToSupabase(supabaseSession, user.id);
        }
      } catch (error) {
        console.error('Error saving active chat session:', error);
      } finally {
        isSaving = false;
      }
    };
    
    // Debounce chat saving to reduce database operations
    const debounceTimer = setTimeout(saveActiveChatSession, 1000);
    
    return () => {
      clearTimeout(debounceTimer);
    };
  }, [chatSessions, activeChatId, user?.id, isLoadingChatSessions]);

  useEffect(() => {
    // Remove automatic scrolling behavior completely
    // We'll only scroll programmatically when user explicitly requests it
  }, [activeChat?.messages]);

  const loadHistory = async () => {
    const history = await getAnalysisHistory(user?.id);
    setHistoryItems(history);
    console.log('Loaded history items for AI consultant:', history.length, 'items', user?.id);
  };

  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: ChatSession = {
      id: newChatId,
      title: 'Новый чат',
      messages: [{
        type: 'ai',
        text: `Здравствуйте! Я AI-консультант Diabetly. Я готов ответить на ваши вопросы о результатах анализа. Чтобы начать, используйте символ @ и выберите анализ.`,
        timestamp: new Date(Date.now() - 2000)
      }],
      mentionedAnalysis: null
    };

    setChatSessions(prev => [...prev, newChat]);
    setActiveChatId(newChatId);
  };

  // Create the first chat if none exists
  useEffect(() => {
    if (chatSessions.length === 0 && historyItems.length > 0 && !isLoadingChatSessions) {
      createNewChat();
    }
  }, [historyItems, chatSessions.length, isLoadingChatSessions]);

  const handleSubmitQuestion = async () => {
    if (!consultationQuestion.trim() || !activeChatId || isSubmittingQuestion) return;
    
    // Check if an analysis is selected
    const currentChat = chatSessions.find(chat => chat.id === activeChatId);
    if (!currentChat || !currentChat.mentionedAnalysis) {
      toast({
        title: "Выберите анализ",
        description: "Пожалуйста, сначала выберите анализ, используя символ @",
        variant: "destructive"
      });
      return;
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      type: 'user',
      text: consultationQuestion.trim(),
      timestamp: new Date()
    };
    
    // Update chat with user message
    setChatSessions(prev => prev.map(chat => 
      chat.id === activeChatId 
        ? { 
            ...chat, 
            messages: [...chat.messages, userMessage]
          }
        : chat
    ));
    
    // Clear input
    setConsultationQuestion('');

    try {
      // Find the analysis data for the selected analysis
      const analysisItem = historyItems.find(item => 
        item.id === currentChat.mentionedAnalysis?.id
      );
      
      if (!analysisItem) {
        throw new Error("Анализ не найден");
      }
      
      // Set loading state while waiting for response
      setIsSubmittingQuestion(true);
      
      // Call the API service
      const response = await apiService.getConsultation(
        analysisItem.analysis_id,
        userMessage.text
      );
      
      // Add AI response to chat
      setChatSessions(prev => {
        const updatedSessions = prev.map(chat => 
          chat.id === activeChatId 
            ? { 
                ...chat, 
                messages: [...chat.messages, {
                  type: 'ai',
                  text: response.consultation,
                  timestamp: new Date()
                }]
              }
            : chat
        );
        
        return updatedSessions;
      });
      
      // Update chat title if it's a new chat
      if (currentChat.title === 'Новый чат' && userMessage.text) {
        setChatSessions(prev => {
          const updatedSessions = prev.map(chat => 
            chat.id === activeChatId 
              ? { ...chat, title: userMessage.text.substring(0, 20) + (userMessage.text.length > 20 ? '...' : '') }
              : chat
          );
          
          return updatedSessions;
        });
      }
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message to chat
      setChatSessions(prev => prev.map(chat => 
        chat.id === activeChatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, {
                type: 'ai',
                text: "Извините, произошла ошибка при обработке вашего вопроса. Пожалуйста, попробуйте еще раз позже.",
                timestamp: new Date()
              }]
            }
          : chat
      ));
      
      toast({
        title: "Ошибка",
        description: "Не удалось получить ответ от AI-консультанта",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setConsultationQuestion(value);
    
    // Check for @ symbol to trigger mention suggestions
    const lastAtSymbolIndex = value.lastIndexOf('@');
    
    if (lastAtSymbolIndex !== -1 && (activeChat && !activeChat.mentionedAnalysis)) {
      const query = value.slice(lastAtSymbolIndex + 1).trim().toLowerCase();
      setSearchQuery(query);
      
      // Filter analyses based on query
      const filtered = historyItems.filter(item => {
        const date = new Date(item.date);
        const dateString = date.toLocaleDateString('ru-RU');
        return query === '' || 
               dateString.toLowerCase().includes(query) || 
               item.result.highest_probability_class.toLowerCase().includes(query);
      });
      
      setFilteredAnalyses(filtered);
      setShowMentionSuggestions(true);
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const selectAnalysis = (item: AnalysisHistoryItem) => {
    if (!activeChatId) return;
    
    const displayText = `анализ от ${formatDateShort(item.date)}`;
    
    // Set the mentioned analysis for the active chat
    const newMentionedAnalysis = {
      id: item.id,
      date: item.date,
      analysis_id: item.analysis_id,
      displayText
    };

    setChatSessions(prev => prev.map(chat => 
      chat.id === activeChatId 
        ? { ...chat, mentionedAnalysis: newMentionedAnalysis }
        : chat
    ));
    
    // Remove the @mention text from input completely
    const currentText = consultationQuestion;
    const atIndex = currentText.lastIndexOf('@');
    
    // Remove the @query part
    const textBeforeAt = currentText.substring(0, atIndex);
    const textAfterQuery = currentText.substring(atIndex).replace(/^@[^\s]*/, '');
    
    setConsultationQuestion(textBeforeAt + textAfterQuery);
    setShowMentionSuggestions(false);
  };

  const removeMention = () => {
    setChatSessions(prev => prev.map(chat => 
      chat.id === activeChatId 
        ? { ...chat, mentionedAnalysis: null }
        : chat
    ));
  };

  const deleteChat = (chatId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот чат?')) {
      // Remove chat from local state
      setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
      
      // If the deleted chat was active, set the first remaining chat as active
      if (activeChatId === chatId && chatSessions.length > 1) {
        const remainingChats = chatSessions.filter(chat => chat.id !== chatId);
        setActiveChatId(remainingChats[0]?.id || null);
      } else if (chatSessions.length <= 1) {
        // If it was the last chat, create a new one
        createNewChat();
      }
      
      // Delete from Supabase if user is logged in
      if (user?.id) {
        deleteSupabaseChatSession(chatId, user.id).catch(error => {
          console.error('Error deleting chat session from Supabase:', error);
        });
      }
    }
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'numeric',
      year: '2-digit'
    }).replace(/\./g, '.');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col min-h-screen h-screen bg-gradient-to-b from-white to-gray-50/50">
      <NavBar />
      
      <main className="flex flex-1 overflow-hidden relative z-10 flex-grow" style={{ minHeight: "calc(100vh - 80px)" }}>
        {/* Chat Sidebar */}
        <div className="w-64 border-r bg-white shadow-sm hidden md:flex flex-col">
          <div className="p-3 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Чаты</h2>
            <Button 
              onClick={createNewChat} 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {chatSessions.map(chat => (
                <div 
                  key={chat.id}
                  className={cn(
                    "p-2 rounded-md cursor-pointer group flex justify-between items-center",
                    chat.id === activeChatId ? "bg-diabetly-blue/10 text-diabetly-blue" : "hover:bg-gray-100"
                  )}
                  onClick={() => {
                    // Just change the active chat ID, no scrolling needed
                    setActiveChatId(chat.id);
                  }}
                >
                  <span className="text-sm truncate flex-1">{chat.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {chatSessions.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Нет активных чатов
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-3 border-t">
            <Button 
              onClick={createNewChat} 
              className="w-full bg-diabetly-blue hover:bg-diabetly-darkblue"
            >
              <Plus className="h-4 w-4 mr-2" />
              Новый чат
            </Button>
            <div className="text-xs text-center mt-2 text-gray-500">
              Чаты сохраняются автоматически
            </div>
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {historyItems.length > 0 && activeChat ? (
            <>
              {/* Mobile Chat Selector */}
              <div className="md:hidden border-b p-2 flex flex-col bg-white">
                <div className="text-center mb-2">
                  <h2 className="font-semibold text-diabetly-blue text-lg">Diabetly AI Ассистент</h2>
                </div>
                <div className="flex overflow-x-auto gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createNewChat}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Новый чат
                  </Button>
                  
                  {chatSessions.map(chat => (
                    <button
                      key={chat.id}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm whitespace-nowrap shrink-0",
                        chat.id === activeChatId 
                          ? "bg-diabetly-blue text-white" 
                          : "bg-gray-100 hover:bg-gray-200"
                      )}
                      onClick={() => {
                        // Just change the active chat ID, no scrolling needed
                        setActiveChatId(chat.id);
                      }}
                    >
                      {chat.title}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: "calc(100vh - 100px)" }}>
                {/* Chat Header */}
                <div className="bg-white p-3 border-b flex items-center justify-center">
                  <h2 className="font-semibold text-diabetly-blue text-lg">Diabetly AI Ассистент</h2>
                </div>
                
                {/* Chat Messages */}
                <div className="flex-1 p-4 h-[calc(100vh-240px)] overflow-y-auto relative" 
                     ref={scrollAreaRef}>
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {activeChat.messages.map((message, index) => (
                      <div 
                        key={index} 
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[85%] rounded-lg px-5 py-3 ${
                            message.type === 'user' 
                              ? 'bg-diabetly-blue text-white' 
                              : 'bg-white border border-gray-200 text-gray-800'
                          }`}
                        >
                          <div className="whitespace-pre-line">{message.text}</div>
                          <div 
                            className={`text-xs mt-1 ${
                              message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isSubmittingQuestion && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-lg px-5 py-3 bg-white border border-gray-200">
                          <div className="flex items-center space-x-2">
                            <MessageLoading />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="p-4 border-t bg-white">
                  <div className="max-w-4xl mx-auto relative">
                    {activeChat.mentionedAnalysis && (
                      <div className="absolute left-3 top-3 z-10">
                        <MentionBadge
                          text={activeChat.mentionedAnalysis.displayText}
                          onRemove={removeMention}
                        />
                      </div>
                    )}
                    
                    <ChatInput 
                      value={consultationQuestion}
                      onChange={handleQuestionChange}
                      onSubmit={handleSubmitQuestion}
                      loading={isSubmittingQuestion}
                      className="relative"
                    >
                      <ChatInputTextArea 
                        placeholder={activeChat.mentionedAnalysis ? "Введите ваш вопрос..." : "Используйте @ чтобы выбрать анализ"}
                        className={activeChat.mentionedAnalysis ? "pt-12" : ""}
                      />
                      <div className="absolute right-2 bottom-2">
                        <ChatInputSubmit />
                      </div>
                    </ChatInput>
                    
                    {/* Mention suggestions */}
                    {showMentionSuggestions && !activeChat.mentionedAnalysis && (
                      <div className="absolute bottom-full mb-1 left-0 w-full bg-white border rounded-md shadow-md max-h-60 overflow-y-auto z-20">
                        {filteredAnalyses.length > 0 ? (
                          <div>
                            {filteredAnalyses.map((item) => (
                              <div 
                                key={item.id}
                                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                onClick={() => selectAnalysis(item)}
                              >
                                <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                                  <img 
                                    src={item.imageUrl} 
                                    alt="Снимок сетчатки" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="text-sm font-medium">Анализ от {formatDate(item.date)}</div>
                                  <div className="text-xs text-gray-500">{item.result.highest_probability_class}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 text-center text-gray-500">Не найдено анализов</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center h-full overflow-y-auto">
              {historyItems.length > 0 ? (
                <div className="text-center space-y-6">
                  <div className="mb-8">
                    <div className="w-16 h-16 bg-diabetly-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-diabetly-blue" />
                    </div>
                    <h2 className="text-2xl font-semibold text-diabetly-darkblue mb-2">
                      Начните новый чат
                    </h2>
                    <div className="max-w-md mx-auto">
                      <TextShimmerQuestion />
                      <div className="mt-4">
                        <TextShimmerTip />
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={createNewChat} 
                    className="bg-diabetly-blue hover:bg-diabetly-darkblue"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Начать чат
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-8 border border-diabetly-skyblue/20">
                    <div className="mx-auto w-16 h-16 bg-diabetly-blue/10 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="h-8 w-8 text-diabetly-blue" />
                    </div>
                    <h3 className="text-xl font-medium mb-3 text-diabetly-darkblue">
                      Нет доступных анализов
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                      Для начала консультации с AI необходимо провести анализ сетчатки глаза. Пройдите сканирование или загрузите изображение для анализа.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button 
                        onClick={() => navigate('/scan')}
                        className="bg-diabetly-blue hover:bg-diabetly-darkblue"
                      >
                        Сканировать сетчатку
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/history')}
                        className="border-diabetly-blue text-diabetly-blue hover:bg-diabetly-blue/10"
                      >
                        История анализов
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Chat; 