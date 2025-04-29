import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Heart, HeartPulse, Info, Eye, ArrowRight, BarChart, Activity, Clock, FileText, ChevronRight, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import RecommendationsAccordion from './RecommendationsAccordion';
import { generatePDF } from '@/lib/pdf-generator';
import { useToast } from '@/components/ui/use-toast';

type ResultLevel = 'low' | 'medium' | 'high';

interface AnalysisResultProps {
  loading: boolean;
  resultData?: {
    riskLevel: ResultLevel;
    riskScore: number;
    confidence: number;
    findings: string[];
    recommendations: Record<string, string>;
    nextCheckupRecommendation: string;
  };
  onReset: () => void;
  imageData?: string | null;
}

const AnalysisResult = ({ loading, resultData, onReset, imageData }: AnalysisResultProps) => {
  const [progress, setProgress] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();

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

  const handleDownloadPDF = async () => {
    if (!resultData) return;
    
    try {
      setIsGeneratingPDF(true);
      toast({
        title: "Создание PDF",
        description: "Подготовка документа для скачивания...",
      });
      
      await generatePDF(resultData, imageData || null);
      
      toast({
        title: "PDF создан",
        description: "Документ успешно скачан",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать PDF документ",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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

  const { riskLevel, riskScore, confidence, findings, recommendations, nextCheckupRecommendation } = resultData;

  const getLevelColor = () => {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getLevelBgColor = () => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100';
      case 'medium': return 'bg-yellow-100';
      case 'high': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getLevelIcon = () => {
    switch (riskLevel) {
      case 'low': return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'medium': return <AlertCircle className="h-6 w-6 text-yellow-600" />;
      case 'high': return <HeartPulse className="h-6 w-6 text-red-600" />;
      default: return <Heart className="h-6 w-6 text-gray-600" />;
    }
  };

  const getLevelText = () => {
    switch (riskLevel) {
      case 'low': return 'Низкая вероятность';
      case 'medium': return 'Средняя вероятность';
      case 'high': return 'Высокая вероятность';
      default: return 'Неопределенный результат';
    }
  };

  const currentDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Normalize the risk score to a percentage (assuming max score is 10)
  const riskPercentage = Math.min(Math.round((riskScore / 10) * 100), 100);
  const progressColor = riskLevel === 'low' ? 'bg-green-500' : riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <Card className="animate-fade-in shadow-lg border-diabetly-skyblue overflow-hidden bg-white/90 backdrop-blur-sm">
      <CardHeader className="border-b bg-gradient-to-r from-diabetly-blue/10 to-diabetly-skyblue/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-diabetly-blue" />
            Результаты анализа
          </CardTitle>
          <Badge variant="outline" className="text-xs flex items-center gap-1 bg-white/80 backdrop-blur-sm">
            <Clock className="h-3 w-3" /> 
            {currentDate}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="mb-2 text-center">
          <Badge className={`inline-flex gap-1 ${getLevelBgColor()} ${getLevelColor()} border-0 px-3 py-1`}>
            {getLevelIcon()}
            <span className="font-medium">{getLevelText()}</span>
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
          <div className="w-40 h-40 relative rounded-full flex items-center justify-center border-4 border-gray-100 shadow-inner">
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div 
                className={`h-full ${progressColor} transition-all duration-1000 ease-out`}
                style={{ width: '100%', transform: `translateY(${100 - riskPercentage}%)` }}
              ></div>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-3xl font-bold">{riskPercentage}%</span>
              <span className="text-xs text-gray-500">Риск ретинопатии</span>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-3 text-diabetly-darkblue">Диагностический отчет</h3>
            <Alert className={`${getLevelBgColor()} border-0 mb-2`}>
              <AlertTitle className="flex items-center gap-2">
                {getLevelIcon()}
                <span>Диабетическая ретинопатия</span>
              </AlertTitle>
              <AlertDescription>
                {findings.length > 0 && (
                  <p className="mt-2 text-gray-700">{findings[0]}</p>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-md flex items-center gap-2 border border-diabetly-skyblue/20">
                <Calendar className="h-4 w-4 text-diabetly-blue" />
                <div>
                  <p className="text-xs text-gray-500">След. осмотр</p>
                  <p className="text-sm font-medium">{nextCheckupRecommendation}</p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-md flex items-center gap-2 border border-diabetly-skyblue/20">
                <Activity className="h-4 w-4 text-diabetly-blue" />
                <div>
                  <p className="text-xs text-gray-500">Точность</p>
                  <p className="text-sm font-medium">{confidence}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />

        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-diabetly-darkblue">
            <InfoIcon className="h-5 w-5 text-diabetly-blue" />
            Выявленные признаки:
          </h4>
          <div className="space-y-2 mb-6">
            {findings.map((finding, index) => (
              <div key={index} className="p-3 border border-diabetly-skyblue/20 bg-white/80 backdrop-blur-sm rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-diabetly-blue/10 flex items-center justify-center">
                      <ChevronRight className="h-3 w-3 text-diabetly-blue" />
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{finding}</p>
                </div>
              </div>
            ))}
          </div>

          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-diabetly-darkblue">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Рекомендации:
          </h4>
          <div className="bg-white/80 backdrop-blur-sm p-4 border border-diabetly-skyblue/20 rounded-lg">
            <RecommendationsAccordion recommendations={recommendations} />
          </div>
        </div>
        
        <CardFooter className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto" 
            onClick={onReset}
          >
            Новый анализ
          </Button>
          
          <Button 
            className="w-full sm:w-auto bg-diabetly-blue hover:bg-diabetly-darkblue transition-colors"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
          >
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingPDF ? 'Создание PDF...' : 'Скачать PDF отчет'}
          </Button>
        </CardFooter>
      </CardContent>

      <CardFooter className="bg-gradient-to-r from-diabetly-blue/5 to-diabetly-skyblue/5 border-t border-diabetly-skyblue/10 py-3 px-6">
        <div className="w-full flex justify-between items-center">
          <p className="text-xs text-gray-500">Результаты анализа не заменяют консультацию врача</p>
          <Badge variant="secondary" className="bg-white/50">
            <span className="text-xs text-diabetly-darkblue">Diabetly AI</span>
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
};

// Need to add missing Icon
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
