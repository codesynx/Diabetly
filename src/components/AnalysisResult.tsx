import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Heart, HeartPulse, Info, Eye, ArrowRight, BarChart, Activity, Clock, FileText, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AnalysisResult as ApiAnalysisResult } from '@/lib/api-service';

interface AnalysisResultProps {
  loading: boolean;
  resultData?: ApiAnalysisResult;
  onReset: () => void;
  imageData?: string | null;
}

const AnalysisResult = ({ loading, resultData, onReset, imageData }: AnalysisResultProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(timer);
            return 95;
          }
          return prev + 5;
        });
      }, 500);
      
      return () => {
        clearInterval(timer);
        if (!loading) {
          setProgress(100);
        }
      };
    } else {
      setProgress(100);
    }
  }, [loading]);

  if (loading) {
    return (
      <Card className="animate-fade-in shadow-lg border-diabetly-skyblue overflow-hidden bg-white/90 backdrop-blur-sm">
        <CardHeader className="border-b bg-gradient-to-r from-diabetly-blue/10 to-diabetly-skyblue/10">
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Eye className="h-5 w-5 text-diabetly-blue animate-pulse" />
            Анализ в процессе...
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="mx-auto w-20 h-20 mb-4 relative">
              <svg className="animate-spin w-full h-full text-diabetly-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Eye className="h-6 w-6 text-diabetly-lightblue" />
              </div>
            </div>
            
            <h3 className="text-xl font-medium text-diabetly-darkblue mb-2">Анализ изображения</h3>
            <p className="text-gray-600 mb-6">ИИ проводит анализ вашего снимка, этот процесс может занять несколько минут</p>
            
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Предварительная обработка</span>
                <span>Финальный анализ</span>
              </div>
              <Progress value={progress} className="w-full h-2 mb-2 bg-gray-200" />
              <div className="flex justify-between">
                <p className="text-xs text-gray-500">Шаг 2 из 3</p>
                <p className="text-sm font-medium text-diabetly-blue">{progress}%</p>
              </div>
            </div>

            <div className="mt-8 px-4 py-6 bg-diabetly-blue/5 rounded-lg border border-diabetly-skyblue/20">
              <div className="flex justify-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-diabetly-blue/10 flex items-center justify-center mb-2">
                    <FileText className="h-5 w-5 text-diabetly-blue" />
                  </div>
                  <p className="text-xs text-gray-600">Обработка данных</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-diabetly-blue/10 flex items-center justify-center mb-2">
                    <BarChart className="h-5 w-5 text-diabetly-blue" />
                  </div>
                  <p className="text-xs text-gray-600">Анализ паттернов</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-diabetly-skyblue/20 flex items-center justify-center mb-2">
                    <Activity className="h-5 w-5 text-diabetly-skyblue" />
                  </div>
                  <p className="text-xs text-gray-600">Диагностика</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!resultData) return null;

  const { riskLevel, highest_probability_class, severity_index, detailed_classification, clinical_information } = resultData;

  const getLevelColor = () => {
    switch (riskLevel) {
      case 'Низкий': return 'text-green-600';
      case 'Средний': return 'text-yellow-600';
      case 'Высокий': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getLevelBgColor = () => {
    switch (riskLevel) {
      case 'Низкий': return 'bg-green-100';
      case 'Средний': return 'bg-yellow-100';
      case 'Высокий': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getLevelIcon = () => {
    switch (riskLevel) {
      case 'Низкий': return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'Средний': return <AlertCircle className="h-6 w-6 text-yellow-600" />;
      case 'Высокий': return <HeartPulse className="h-6 w-6 text-red-600" />;
      default: return <Heart className="h-6 w-6 text-gray-600" />;
    }
  };

  const getLevelText = () => {
    switch (highest_probability_class) {
      case 'Нет ДР': return 'Признаки диабетической ретинопатии не обнаружены';
      case 'Легкая': return 'Легкая непролиферативная диабетическая ретинопатия';
      case 'Умеренная': return 'Умеренная непролиферативная диабетическая ретинопатия';
      case 'Тяжелая': return 'Тяжелая непролиферативная диабетическая ретинопатия';
      case 'Пролиферативная ДР': return 'Пролиферативная диабетическая ретинопатия';
      default: return 'Неопределенный результат';
    }
  };

  const currentDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Normalize the severity index to a percentage (assuming max is 100)
  const severityPercentage = Math.min(Math.round(severity_index), 100);
  const progressColor = riskLevel === 'Низкий' ? 'bg-green-500' : riskLevel === 'Средний' ? 'bg-yellow-500' : 'bg-red-500';

  // Format the findings from clinical information
  const findings = clinical_information.findings
    .split('.')
    .map(item => item.trim())
    .filter(item => item.length > 0);

  return (
    <Card className="animate-fade-in shadow-lg border-diabetly-skyblue overflow-hidden bg-white/90 backdrop-blur-sm">
      <CardHeader className={`border-b ${getLevelBgColor()} bg-gradient-to-r from-white to-transparent`}>
        <CardTitle className="flex items-center gap-2">
          {getLevelIcon()}
          <span className={`${getLevelColor()}`}>{getLevelText()}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {imageData && (
              <div className="md:w-1/3">
                <div className="aspect-[4/3] rounded-lg overflow-hidden border border-diabetly-skyblue/20 mb-4">
                  <img 
                    src={imageData} 
                    alt="Снимок сетчатки глаза" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="text-sm font-medium text-diabetly-darkblue mb-1 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-diabetly-blue" />
                    Информация о снимке
                  </h3>
                  <div className="text-sm">
                    <p className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">Дата:</span>
                      <span className="font-medium">{currentDate}</span>
                    </p>
                    <p className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">Класс:</span>
                      <span className="font-medium">{highest_probability_class}</span>
                    </p>
                    <p className="flex justify-between py-1">
                      <span className="text-gray-600">ID анализа:</span>
                      <span className="font-medium text-xs">{resultData.analysis_id.substring(0, 8)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className={`${imageData ? 'md:w-2/3' : 'w-full'}`}>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-diabetly-darkblue flex items-center gap-2">
                      <Activity className="h-5 w-5 text-diabetly-blue" />
                      Индекс тяжести
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={`${getLevelBgColor()} ${getLevelColor()} border-none`}
                    >
                      {getLevelIcon()}
                      <span className="ml-1">{severityPercentage}/100</span>
                    </Badge>
                  </div>
                  
                  <div className="bg-gray-100 w-full h-3 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full ${progressColor}`}
                      style={{ width: `${severityPercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Низкий</span>
                    <span>Средний</span>
                    <span>Высокий</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium text-diabetly-darkblue flex items-center gap-2 mb-3">
                    <InfoIcon className="h-5 w-5 text-diabetly-blue" />
                    Детальная классификация
                  </h3>
                  
                  <div className="space-y-3">
                    {detailed_classification.map((classification, index) => (
                      <div key={index} className="relative overflow-hidden bg-white rounded-md border border-gray-200 p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2">
                            <span className="text-sm font-medium">{classification.class}</span>
                          </div>
                          <Badge variant="outline" className="bg-white">
                            {Math.round(classification.percentage)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{classification.description}</p>
                        <div 
                          className="absolute bottom-0 left-0 h-1"
                          style={{ 
                            width: `${classification.percentage}%`,
                            backgroundColor: classification.class === 'No DR' ? '#10b981' : 
                                            classification.class === 'Mild' || classification.class === 'Moderate' ? '#f59e0b' : 
                                            '#ef4444'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium text-diabetly-darkblue flex items-center gap-2 mb-3">
                    <Eye className="h-5 w-5 text-diabetly-blue" />
                    Результаты анализа
                  </h3>
                  
                  <div className="bg-white rounded-md border border-gray-200 p-4 mb-4">
                    <h4 className="font-medium text-diabetly-darkblue mb-2">Обнаруженные признаки:</h4>
                    <ul className="space-y-1 mb-4">
                      {findings.map((finding, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-diabetly-blue mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{finding}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <h4 className="font-medium text-diabetly-darkblue mb-2">Рекомендации:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{clinical_information.recommendations}</p>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-diabetly-blue" />
                        <span className="text-sm text-gray-700">Следующий осмотр:</span>
                      </div>
                      <span className="text-sm font-medium">{clinical_information.follow_up}</span>
                    </div>
                  </div>
                  
                  <Alert className="bg-diabetly-blue/5 border-diabetly-blue/20 mb-4">
                    <AlertTitle className="flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-diabetly-blue" />
                      Объяснение
                    </AlertTitle>
                    <AlertDescription className="text-sm text-gray-700 mt-1">
                      {resultData.ai_explanation}
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 flex flex-wrap gap-3 justify-between items-center border-t bg-white">
        <Button 
          variant="outline" 
          onClick={onReset}
        >
          Сделать новый анализ
        </Button>
        
        <div className="text-sm text-gray-500">
          <span className="font-medium">Примечание:</span> Результаты анализа не являются медицинским диагнозом. Пожалуйста, проконсультируйтесь с врачом.
        </div>
      </CardFooter>
    </Card>
  );
};

// Info Icon Component
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

export default AnalysisResult;
