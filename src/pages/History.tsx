import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Trash2, Calendar, Activity, AlertCircle, Eye, Info, History as HistoryIcon, Clock, ArrowRight, CheckCircle, HeartPulse } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { getAnalysisHistory, deleteHistoryItem, clearAnalysisHistory, AnalysisHistoryItem } from '@/lib/storage-service';
import RecommendationsAccordion from '@/components/RecommendationsAccordion';

const History = () => {
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<AnalysisHistoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'scan' | 'upload'>('all');
  const navigate = useNavigate();

  // Load history from localStorage on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const history = getAnalysisHistory();
    setHistoryItems(history);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Вы уверены, что хотите удалить этот элемент истории?')) {
      deleteHistoryItem(id);
      loadHistory();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Вы уверены, что хотите очистить всю историю? Это действие нельзя отменить.')) {
      clearAnalysisHistory();
      loadHistory();
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

  const filteredHistory = activeTab === 'all' 
    ? historyItems 
    : historyItems.filter(item => item.method === activeTab);

  const getRiskLevelBadge = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Низкий риск
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Средний риск
          </Badge>
        );
      case 'high':
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
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="border-diabetly-blue text-diabetly-blue hover:bg-diabetly-blue/10"
                  onClick={() => navigate('/scan')}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Новый анализ
                </Button>
                {historyItems.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={handleClearHistory}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Очистить историю
                  </Button>
                )}
              </div>
            </div>
            
            {historyItems.length > 0 ? (
              <>
                <Tabs defaultValue="all" className="mb-8" onValueChange={(value) => setActiveTab(value as any)}>
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="all">Все</TabsTrigger>
                    <TabsTrigger value="scan">Сканирование</TabsTrigger>
                    <TabsTrigger value="upload">Загрузка</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredHistory.map((item) => (
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
                  </TabsContent>
                  
                  <TabsContent value="scan" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredHistory.map((item) => (
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
                  </TabsContent>
                  
                  <TabsContent value="upload" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredHistory.map((item) => (
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
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-8 border border-diabetly-skyblue/20">
                  <div className="mx-auto w-16 h-16 bg-diabetly-blue/10 rounded-full flex items-center justify-center mb-4">
                    <HistoryIcon className="h-8 w-8 text-diabetly-blue" />
                  </div>
                  <h3 className="text-xl font-medium mb-3 text-diabetly-darkblue">
                    История пуста
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                    У вас еще нет сохраненных анализов сетчатки. Пройдите новое сканирование, чтобы результаты автоматически появились здесь.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={() => navigate('/scan')}
                      className="bg-diabetly-blue hover:bg-diabetly-darkblue"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Сканировать сетчатку
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/upload')}
                      className="border-diabetly-blue text-diabetly-blue hover:bg-diabetly-blue/10"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Загрузить изображение
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {historyItems.length > 0 && (
              <Alert className="bg-white/90 backdrop-blur-sm border shadow-sm">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-diabetly-blue mt-0.5" />
                  <AlertDescription>
                    <h3 className="text-md font-semibold mb-1 text-diabetly-darkblue">
                      О данных истории
                    </h3>
                    <div className="text-gray-700 text-sm">
                      <p>
                        История анализов хранится локально на вашем устройстве и будет доступна, пока вы не очистите кэш браузера или не удалите историю вручную.
                      </p>
                    </div>
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>
        </div>
      </main>
      
      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-diabetly-darkblue">
                  <Clock className="h-5 w-5 text-diabetly-blue" />
                  Результат от {formatDate(selectedItem.date)}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div className="md:col-span-1">
                  <div className="flex flex-col space-y-4">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden border border-diabetly-skyblue/20">
                      <img 
                        src={selectedItem.imageUrl} 
                        alt="Скан сетчатки" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Метод:</span>
                        <span className="text-sm font-medium">
                          {selectedItem.method === 'scan' ? 'Сканирование' : 'Загрузка'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Уровень риска:</span>
                        <span className="text-sm font-medium">
                          {selectedItem.result.riskLevel === 'low' ? 'Низкий' : 
                           selectedItem.result.riskLevel === 'medium' ? 'Средний' : 'Высокий'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Оценка риска:</span>
                        <span className="text-sm font-medium">{selectedItem.result.riskScore}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Точность:</span>
                        <span className="text-sm font-medium">{selectedItem.result.confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">След. осмотр:</span>
                        <span className="text-sm font-medium">{selectedItem.result.nextCheckupRecommendation}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-diabetly-darkblue flex items-center gap-2">
                        <InfoIcon className="h-5 w-5 text-diabetly-blue" />
                        Выявленные признаки
                      </h3>
                      <div className="space-y-2">
                        {selectedItem.result.findings.map((finding, idx) => (
                          <div key={idx} className="p-3 bg-white rounded-md border border-diabetly-skyblue/20">
                            <div className="flex items-start gap-2">
                              <div className="mt-1 flex-shrink-0">
                                <div className="w-4 h-4 rounded-full bg-diabetly-blue/10 flex items-center justify-center">
                                  <ArrowRight className="h-2.5 w-2.5 text-diabetly-blue" />
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">{finding}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-diabetly-darkblue flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Рекомендации
                      </h3>
                      <div className="bg-white rounded-md border border-diabetly-skyblue/20 p-3">
                        <RecommendationsAccordion recommendations={selectedItem.result.recommendations} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="mt-8">
                <Button 
                  variant="outline" 
                  className="border-red-500 text-red-500 hover:bg-red-50 mr-auto"
                  onClick={(e) => {
                    handleDeleteItem(selectedItem.id, e);
                    setSelectedItem(null);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить из истории
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Закрыть</Button>
                </DialogClose>
                <Button onClick={() => navigate('/scan')} className="bg-diabetly-blue hover:bg-diabetly-darkblue">
                  Новый анализ
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

interface HistoryCardProps {
  item: AnalysisHistoryItem;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onSelect: () => void;
  formatDate: (date: string) => string;
  getRiskLevelBadge: (level: 'low' | 'medium' | 'high') => React.ReactNode;
  getMethodBadge: (method: 'scan' | 'upload') => React.ReactNode;
}

const HistoryCard = ({ item, onDelete, onSelect, formatDate, getRiskLevelBadge, getMethodBadge }: HistoryCardProps) => {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer border-diabetly-skyblue/30 overflow-hidden"
      onClick={onSelect}
    >
      <div className="bg-gradient-to-r from-diabetly-blue/5 to-diabetly-skyblue/5 px-4 py-2 border-b border-diabetly-skyblue/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-diabetly-blue" />
            <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
          </div>
          <button 
            onClick={(e) => onDelete(item.id, e)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-3 h-full">
          <div className="col-span-1 aspect-square overflow-hidden">
            <img 
              src={item.imageUrl} 
              alt="Скан сетчатки" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="col-span-2 p-4">
            <div className="flex gap-2 flex-wrap mb-3">
              {getRiskLevelBadge(item.result.riskLevel)}
              {getMethodBadge(item.method)}
            </div>
            
            <div className="mb-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="h-3.5 w-3.5 text-diabetly-blue" />
                <span className="text-xs text-gray-500">Оценка риска:</span>
              </div>
              <div className="bg-gray-100 w-full h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    item.result.riskLevel === 'low' ? 'bg-green-500' : 
                    item.result.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(item.result.riskScore / 10) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-xs text-gray-500">Оценка: {item.result.riskScore}/10</span>
                <span className="text-xs text-gray-500">Точность: {item.result.confidence}%</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 mt-3">
              <Calendar className="h-3.5 w-3.5 text-diabetly-blue" />
              <span className="text-xs text-gray-500">След. осмотр: {item.result.nextCheckupRecommendation}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Info Icon
const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export default History; 