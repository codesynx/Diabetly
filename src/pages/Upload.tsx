import { useState } from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ImageUploader from '@/components/ImageUploader';
import AnalysisResult from '@/components/AnalysisResult';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, AlertCircle, Info, FileText, BarChart, Activity } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { processImage } from '../../image-processor';
import { saveAnalysisToHistory } from '@/lib/storage-service';
import { Progress } from '@/components/ui/progress';

type ResultLevel = 'low' | 'medium' | 'high';

interface AnalysisResultData {
  riskLevel: ResultLevel;
  riskScore: number;
  confidence: number;
  findings: string[];
  recommendations: Record<string, string>;
  nextCheckupRecommendation: string;
}

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResultData | null>(null);
  const [progress, setProgress] = useState(0);
  const [imageData, setImageData] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setResult(null);
    setImageData(null);
    
    // Create a preview of the image for reference
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(reader.result as string);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleAnalysis = async () => {
    if (!file) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, сначала загрузите изображение",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    setProgress(0);
    
    // Start progress animation
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + Math.random() * 5;
        return newProgress >= 95 ? 95 : newProgress;
      });
    }, 500);
    
    try {
      // Convert the file to a base64 string
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (e.target?.result) {
          const imageData = e.target.result as string;
          
          try {
            // Process the image using our image processor
            const analysisResults = await processImage(imageData);
            
            // Save results to history
            if (imageData && analysisResults) {
              saveAnalysisToHistory(imageData, analysisResults, 'upload');
            }
            
            setProgress(100);
            clearInterval(progressInterval);
            
            setResult(analysisResults);
            toast({
              title: "Анализ завершен",
              description: "Результаты анализа доступны ниже",
            });
          } catch (error) {
            console.error('Error processing image:', error);
            clearInterval(progressInterval);
            toast({
              title: "Ошибка анализа",
              description: "Произошла ошибка при анализе изображения. Попробуйте еще раз.",
              variant: "destructive"
            });
          } finally {
            setAnalyzing(false);
          }
        }
      };
      
      reader.onerror = () => {
        clearInterval(progressInterval);
        toast({
          title: "Ошибка чтения файла",
          description: "Не удалось прочитать выбранный файл",
          variant: "destructive"
        });
        setAnalyzing(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error handling file:', error);
      toast({
        title: "Ошибка обработки файла",
        description: "Произошла ошибка при обработке файла",
        variant: "destructive"
      });
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setAnalyzing(false);
    setImageData(null);
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <NavBar />
      
      
      <main className="flex-grow py-12 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-3 text-diabetly-darkblue">
                Анализ сетчатки глаза
              </h1>
              <p className="text-gray-600 max-w-md mx-auto">
                Загрузите фотографию сетчатки для анализа и диагностики потенциальных признаков диабетической ретинопатии
              </p>
            </div>
            
            {!result && (
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-medium mb-4 text-diabetly-darkblue flex items-center gap-2">
                  <Eye className="h-5 w-5 text-diabetly-blue" />
                  Загрузите снимок
                </h2>
                <div className="mb-6 relative">
                  <ImageUploader onImageUpload={handleImageUpload} />
                  
                  {analyzing && (
                    <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-xl flex items-center justify-center rounded-lg">
                      <div className="text-center p-6">
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
                        <p className="text-gray-600 mb-4">ИИ проводит анализ вашего снимка, этот процесс может занять несколько минут</p>
                        
                        <div className="max-w-md mx-auto">
                          <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Предварительная обработка</span>
                            <span>Финальный анализ</span>
                          </div>
                          <Progress value={progress} className="w-full h-2 mb-2 bg-gray-200" />
                          <div className="flex justify-between">
                            <p className="text-xs text-gray-500">
                              {progress < 30 ? 'Шаг 1 из 3' : progress < 70 ? 'Шаг 2 из 3' : 'Шаг 3 из 3'}
                            </p>
                            <p className="text-sm font-medium text-diabetly-blue">{Math.round(progress)}%</p>
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
                    </div>
                  )}
                </div>
                
                {file && !analyzing && !result && (
                  <div className="flex justify-center mb-4 animate-fade-in">
                    <Button 
                      onClick={handleAnalysis}
                      size="lg"
                      className="bg-diabetly-blue hover:bg-diabetly-darkblue transition-colors shadow-md hover:shadow-lg"
                    >
                      <Eye className="mr-2 h-5 w-5" />
                      Начать анализ
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {result && (
              <div className="mb-8 animate-fade-in">
                <AnalysisResult 
                  loading={false} 
                  resultData={result} 
                  onReset={handleReset}
                  imageData={imageData}
                />
              </div>
            )}
            
            <div className="space-y-6">
              <Alert className="bg-white/90 backdrop-blur-sm border shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-diabetly-blue mt-0.5" />
                  <AlertDescription>
                    <h3 className="text-lg font-semibold mb-2 text-diabetly-darkblue">
                      Важная информация
                    </h3>
                    <div className="text-gray-700 space-y-2">
                      <p>
                        Результаты анализа не являются медицинским диагнозом и не могут заменить консультацию специалиста.
                      </p>
                      <p>
                        При любых подозрениях на заболевание рекомендуется обратиться к офтальмологу для детального обследования.
                      </p>
                    </div>
                  </AlertDescription>
                </div>
              </Alert>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-diabetly-blue/10 flex items-center justify-center mb-4">
                        <Info className="h-6 w-6 text-diabetly-blue" />
                      </div>
                      <h3 className="font-medium mb-2">Что такое ретинопатия?</h3>
                      <p className="text-sm text-gray-600">Повреждение сетчатки, часто связанное с диабетом</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-diabetly-blue/10 flex items-center justify-center mb-4">
                        <Eye className="h-6 w-6 text-diabetly-blue" />
                      </div>
                      <h3 className="font-medium mb-2">Частота проверок</h3>
                      <p className="text-sm text-gray-600">Рекомендуется ежегодное обследование для диабетиков</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-diabetly-blue/10 flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6 text-diabetly-blue" />
                      </div>
                      <h3 className="font-medium mb-2">Раннее выявление</h3>
                      <p className="text-sm text-gray-600">Своевременная диагностика значительно улучшает прогноз</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Upload;
