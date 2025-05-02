import { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Trash2, Calendar, Activity, AlertCircle, Eye, Info, History as HistoryIcon, Clock, ArrowRight, CheckCircle, HeartPulse, FileText, MessageCircle, Download, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { getAnalysisHistory, deleteHistoryItem, clearAnalysisHistory, AnalysisHistoryItem } from '@/lib/storage-service';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

// Component to render a skeleton while loading history items
const HistorySkeleton = () => {
  return (
    <div className="space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row gap-4 p-4">
              <Skeleton className="h-24 w-24 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const History = () => {
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<AnalysisHistoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'scan' | 'upload'>('all');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [includeConsultation, setIncludeConsultation] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load history from Supabase on component mount
  useEffect(() => {
    loadHistory();
  }, [user?.id]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      // Set a timeout to show loading state for very fast loads
      const loadingTimeoutId = setTimeout(() => {
        setIsLoading(true);
      }, 100);

      const history = await getAnalysisHistory(user?.id);
      setHistoryItems(history);
      console.log('Loaded history items:', history.length, 'items');
      
      // Clear timeout if loading is completed quickly
      clearTimeout(loadingTimeoutId);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить историю анализов",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Вы уверены, что хотите удалить этот элемент истории?')) {
      try {
        await deleteHistoryItem(id, user?.id);
        await loadHistory();
        toast({
          title: "Успех",
          description: "Элемент истории успешно удален",
        });
      } catch (error) {
        console.error('Error deleting history item:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось удалить элемент истории",
          variant: "destructive"
        });
      }
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Вы уверены, что хотите очистить всю историю? Это действие нельзя отменить.')) {
      try {
        await clearAnalysisHistory(user?.id);
        await loadHistory();
        toast({
          title: "Успех",
          description: "История анализов успешно очищена",
        });
      } catch (error) {
        console.error('Error clearing history:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось очистить историю анализов",
          variant: "destructive"
        });
      }
    }
  };

  const handleNavigateToChat = (item: AnalysisHistoryItem) => {
    navigate('/chat');
  };

  const handleGenerateReport = async () => {
    if (!selectedItem || !selectedItem.analysis_id) {
      toast({
        title: "Ошибка",
        description: "Не удалось сгенерировать отчет для этого анализа",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGeneratingReport(true);
      await apiService.generateReport(selectedItem.analysis_id, includeConsultation);
      
      toast({
        title: "Отчет сгенерирован",
        description: "Отчет успешно сгенерирован и загружен",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Ошибка генерации отчета",
        description: "Не удалось сгенерировать отчет. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
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

  // Filter history items based on selected tab and memoize the result
  const filteredItems = historyItems.filter(item => {
    if (activeTab === 'all') return true;
    return item.method === activeTab;
  });

  const getRiskLevelBadge = (riskLevel: 'Низкий' | 'Средний' | 'Высокий') => {
    switch (riskLevel) {
      case 'Низкий':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Низкий риск
          </Badge>
        );
      case 'Средний':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Средний риск
          </Badge>
        );
      case 'Высокий':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            <HeartPulse className="h-3.5 w-3.5 mr-1" />
            Высокий риск
          </Badge>
        );
      default:
        return null;
    }
  };

  const getMethodBadge = (method: 'scan' | 'upload') => {
    return (
      <Badge variant="outline" className="bg-white text-diabetly-blue border-diabetly-skyblue/30">
        <Eye className="h-3.5 w-3.5 mr-1" />
        {method === 'scan' ? 'Сканирование' : 'Загрузка'}
      </Badge>
    );
  };

  // Render the history content or a custom message when empty
  const renderHistoryContent = () => {
    if (isLoading) {
      return <HistorySkeleton />;
    }
    
    if (filteredItems.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-diabetly-blue/10 rounded-full flex items-center justify-center mb-4">
            <HistoryIcon className="h-8 w-8 text-diabetly-blue" />
          </div>
          <h3 className="text-xl font-medium mb-3 text-diabetly-darkblue">
            {historyItems.length === 0 ? "История анализов пуста" : "Нет анализов в этой категории"}
          </h3>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            {historyItems.length === 0 
              ? "Вы еще не провели ни одного анализа сетчатки глаза. Пройдите сканирование или загрузите изображение для анализа."
              : "Попробуйте выбрать другую категорию анализов или вернитесь к просмотру всех анализов."}
          </p>
          {historyItems.length === 0 && (
            <Button 
              onClick={() => navigate('/choose-method')}
              className="bg-diabetly-blue hover:bg-diabetly-darkblue"
            >
              Провести анализ
            </Button>
          )}
        </div>
      );
    }
    
    // Render list of history items with virtualization for better performance
    return (
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <HistoryCard
            key={item.id}
            item={item}
            onDelete={handleDeleteItem}
            onSelect={() => setSelectedItem(item)}
            formatDate={formatDate}
            getRiskLevelBadge={getRiskLevelBadge}
            getMethodBadge={getMethodBadge}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <NavBar />
      
      <main className="flex-grow py-12 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-diabetly-darkblue flex items-center gap-2">
                  <HistoryIcon className="h-7 w-7 text-diabetly-blue" />
                  История анализов
                </h1>
                <p className="text-gray-600">
                  Просмотр ваших предыдущих анализов сетчатки глаза
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/choose-method')}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Новый анализ
                </Button>
                {historyItems.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={handleClearHistory}
                    className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Очистить историю
                  </Button>
                )}
              </div>
            </div>
            
            {historyItems.length > 0 && (
              <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'scan' | 'upload')} className="mb-8">
                <TabsList className="bg-white border shadow-sm mb-6 p-1">
                  <TabsTrigger value="all" className="data-[state=active]:bg-diabetly-blue data-[state=active]:text-white">
                    Все анализы ({historyItems.length})
                  </TabsTrigger>
                  <TabsTrigger value="scan" className="data-[state=active]:bg-diabetly-blue data-[state=active]:text-white">
                    Сканирование ({historyItems.filter(item => item.method === 'scan').length})
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="data-[state=active]:bg-diabetly-blue data-[state=active]:text-white">
                    Загрузка ({historyItems.filter(item => item.method === 'upload').length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-0">
                  {renderHistoryContent()}
                </TabsContent>
                
                <TabsContent value="scan" className="mt-0">
                  {renderHistoryContent()}
                </TabsContent>
                
                <TabsContent value="upload" className="mt-0">
                  {renderHistoryContent()}
                </TabsContent>
              </Tabs>
            )}
            
            {historyItems.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-8 border border-diabetly-skyblue/20">
                  <div className="mx-auto w-16 h-16 bg-diabetly-blue/10 rounded-full flex items-center justify-center mb-4">
                    <HistoryIcon className="h-8 w-8 text-diabetly-blue" />
                  </div>
                  <h3 className="text-xl font-medium mb-3 text-diabetly-darkblue">
                    История анализов пуста
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Вы еще не провели ни одного анализа сетчатки глаза. Пройдите сканирование или загрузите изображение для анализа.
                  </p>
                  <Button 
                    onClick={() => navigate('/choose-method')}
                    className="bg-diabetly-blue hover:bg-diabetly-darkblue"
                  >
                    Провести анализ
                  </Button>
                </div>
              </div>
            )}
            
            {/* Selected item detail dialog */}
            {selectedItem && (
              <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-diabetly-darkblue flex items-center gap-2">
                      <HistoryIcon className="h-5 w-5 text-diabetly-blue" />
                      Результаты анализа от {formatDate(selectedItem.date)}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    <div>
                      <div className="rounded-lg overflow-hidden border border-diabetly-skyblue/30 mb-4 relative aspect-[4/3]">
                        <img 
                          src={selectedItem.imageUrl} 
                          alt="Снимок сетчатки глаза" 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {getRiskLevelBadge(selectedItem.result.riskLevel)}
                        {getMethodBadge(selectedItem.method)}
                        <Badge variant="outline" className="bg-white text-gray-600 border-gray-300">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {formatDate(selectedItem.date)}
                        </Badge>
                      </div>
                      
                      <Card className="mb-4">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium text-diabetly-darkblue flex items-center gap-2">
                            <Activity className="h-4 w-4 text-diabetly-blue" />
                            Оценка риска
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Индекс тяжести:</span>
                            <span className="font-medium">{Math.round(selectedItem.result.severity_index)}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div 
                              className={`h-2 rounded-full ${
                                selectedItem.result.riskLevel === 'Низкий' 
                                  ? 'bg-green-500' 
                                  : selectedItem.result.riskLevel === 'Средний' 
                                    ? 'bg-yellow-500' 
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(Math.round(selectedItem.result.severity_index), 100)}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Основная оценка:</span>
                            <span className="font-medium">{selectedItem.result.binary_classification.primary_assessment}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div 
                              className="h-2 rounded-full bg-diabetly-blue"
                              style={{ width: `${Math.round(selectedItem.result.binary_classification.dr_detected * 100)}%` }}
                            ></div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-3">
                            Рекомендованный срок следующего обследования: <span className="font-medium">{selectedItem.result.clinical_information.follow_up}</span>
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium text-diabetly-darkblue flex items-center gap-2">
                            <FileText className="h-4 w-4 text-diabetly-blue" />
                            Генерация отчета
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                              Скачайте полный медицинский отчет с результатами анализа в формате PDF.
                            </p>
                            
                            <div className="flex items-center gap-2 mb-4">
                              <input 
                                type="checkbox" 
                                id="include-consultation" 
                                checked={includeConsultation} 
                                onChange={() => setIncludeConsultation(!includeConsultation)}
                                className="rounded border-gray-300"
                              />
                              <label htmlFor="include-consultation" className="text-sm text-gray-700">
                                Включить информацию ИИ-консультации
                              </label>
                            </div>
                            
                            <Button 
                              onClick={handleGenerateReport}
                              disabled={isGeneratingReport || !selectedItem.analysis_id}
                              className="w-full bg-diabetly-blue hover:bg-diabetly-darkblue"
                            >
                              {isGeneratingReport ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Генерация отчета...
                                </>
                              ) : (
                                <>
                                  <Download className="mr-2 h-4 w-4" />
                                  Скачать отчет
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <Card className="mb-4">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium text-diabetly-darkblue flex items-center gap-2">
                            <Info className="h-4 w-4 text-diabetly-blue" />
                            Результаты анализа
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <h3 className="font-medium text-diabetly-darkblue mb-3">Обнаруженные признаки:</h3>
                          <p className="text-sm text-gray-700 whitespace-pre-line mb-4">
                            {selectedItem.result.clinical_information.findings}
                          </p>
                          
                          <Separator className="my-4" />
                          
                          <h3 className="font-medium text-diabetly-darkblue mb-3">Рекомендации:</h3>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                            <p className="text-sm text-gray-700 whitespace-pre-line">
                              {selectedItem.result.recommendation}
                            </p>
                          </div>
                          
                          <h3 className="font-medium text-diabetly-darkblue mb-3">Клинические рекомендации:</h3>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                            <p className="text-sm text-gray-700 whitespace-pre-line">
                              {selectedItem.result.clinical_information.recommendations}
                            </p>
                          </div>
                          
                          <h3 className="font-medium text-diabetly-darkblue mb-3">Факторы риска:</h3>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700 whitespace-pre-line">
                              {selectedItem.result.clinical_information.risks}
                            </p>
                          </div>
                          
                          {/* Display detailed classification */}
                          <Separator className="my-4" />
                          <h3 className="font-medium text-diabetly-darkblue mb-3">Детальная классификация:</h3>
                          <div className="space-y-3">
                            {selectedItem.result.detailed_classification.map((classification, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-medium text-diabetly-darkblue">{classification.class}</span>
                                  <Badge variant="outline" className="bg-diabetly-blue/10 text-diabetly-blue">
                                    {Math.round(classification.percentage)}%
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{classification.description}</p>
                              </div>
                            ))}
                          </div>
                          
                          {/* Display AI explanation */}
                          <Separator className="my-4" />
                          <h3 className="font-medium text-diabetly-darkblue mb-3">Объяснение ИИ:</h3>
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {selectedItem.result.ai_explanation}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Закрыть</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// History card component
interface HistoryCardProps {
  item: AnalysisHistoryItem;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onSelect: () => void;
  formatDate: (date: string) => string;
  getRiskLevelBadge: (level: 'Низкий' | 'Средний' | 'Высокий') => React.ReactNode;
  getMethodBadge: (method: 'scan' | 'upload') => React.ReactNode;
}

const HistoryCard = ({ item, onDelete, onSelect, formatDate, getRiskLevelBadge, getMethodBadge }: HistoryCardProps) => {
  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle chat navigation logic here
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Image thumbnail - lazy loaded */}
          <div className="w-full md:w-24 h-24 border-b md:border-b-0 md:border-r shrink-0">
            <img 
              src={item.imageUrl} 
              alt="Снимок сетчатки" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          
          {/* Content */}
          <div className="p-4 md:py-3 flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h3 className="font-medium">
                  {item.result.highest_probability_class}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(item.date)}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {getRiskLevelBadge(item.result.riskLevel)}
                {getMethodBadge(item.method)}
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-600 line-clamp-1">
                {item.result.recommendation}
              </p>
              
              <div className="flex gap-1 ml-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full text-diabetly-blue hover:text-diabetly-darkblue hover:bg-diabetly-blue/10"
                  onClick={onSelect}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => onDelete(item.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default History; 