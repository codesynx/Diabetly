import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, Star } from 'lucide-react';
import AnalysisResult from '@/components/AnalysisResult';
import { useToast } from '@/components/ui/use-toast';
import { apiService, AnalysisResult as ApiAnalysisResult } from '@/lib/api-service';
import { saveAnalysisToHistory } from '@/lib/storage-service';
import { useAuth } from '@/lib/auth-context';
import { hasCredits, useCredit } from '@/lib/user-credits-service';

const Scan = () => {
  const [scanningStage, setScanningStage] = useState<'initial' | 'scanning' | 'processing' | 'result'>('initial');
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<ApiAnalysisResult | null>(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [apiHealth, setApiHealth] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { user, userSubscription, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  
  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  // Function to check API health
  const checkApiHealth = async () => {
    try {
      const healthData = await apiService.checkHealth();
      setApiHealth(healthData.status === 'healthy');
      
      if (healthData.status !== 'healthy') {
        toast({
          title: "Предупреждение",
          description: "Сервис анализа в настоящее время недоступен. Пожалуйста, повторите попытку позже.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setApiHealth(false);
      toast({
        title: "Ошибка соединения",
        description: "Не удалось подключиться к сервису анализа. Проверьте ваше интернет-соединение.",
        variant: "destructive"
      });
    }
  };
  
  // Request camera permission and setup video stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing the camera:', error);
        toast({
          title: "Ошибка доступа к камере",
          description: "Пожалуйста, предоставьте доступ к камере для сканирования",
          variant: "destructive"
        });
      }
    }
    
    if (scanningStage === 'initial') {
      setupCamera();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanningStage, toast]);
  
  const handleCapture = async () => {
    // Check if API is healthy before proceeding
    if (!apiHealth) {
      toast({
        title: "Сервис недоступен",
        description: "Сервис анализа в настоящее время недоступен. Пожалуйста, повторите попытку позже.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if user has credits
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для проведения анализа необходимо войти в систему",
        variant: "destructive"
      });
      navigate('/signin');
      return;
    }
    
    // Check if user has enough credits
    const hasEnoughCredits = await hasCredits(user.id);
    if (!hasEnoughCredits) {
      toast({
        title: "Недостаточно кредитов",
        description: "У вас недостаточно кредитов для проведения анализа. Пожалуйста, приобретите кредиты.",
        variant: "destructive"
      });
      navigate('/purchase-credits');
      return;
    }
    
    // Capture the current frame from video
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame on the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert the canvas to a data URL and store it
        const imageUrl = canvas.toDataURL('image/jpeg');
        setCapturedImageUrl(imageUrl);
      }
    }
    
    setScanningStage('scanning');
    
    // Simulate scanning progress with animation
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanningStage('processing');
          
          // Process the image with our API service if we have a captured image
          if (capturedImageUrl) {
            processAndAnalyzeImage(capturedImageUrl);
          } else {
            // Fallback if image capture failed
            toast({
              title: "Ошибка захвата изображения",
              description: "Не удалось получить изображение с камеры",
              variant: "destructive"
            });
            setScanningStage('initial');
          }
          
          return 100;
        }
        return prev + 1;
      });
    }, 50);
  };
  
  // Function to process and analyze the captured image
  const processAndAnalyzeImage = async (imageData: string) => {
    try {
      // Call our API service to analyze the image
      const analysisResults = await apiService.analyzeImageBase64(imageData);
      
      // Use one credit for this analysis
      if (user) {
        await useCredit(user.id);
        
        // Refresh subscription data to update UI
        await refreshSubscription();
      }
      
      // Save results to history
      if (imageData && analysisResults) {
        await saveAnalysisToHistory(imageData, analysisResults, 'scan', user?.id);
      }
      
      setResult(analysisResults);
      setScanningStage('result');
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Ошибка анализа",
        description: "Произошла ошибка при анализе изображения. Попробуйте еще раз.",
        variant: "destructive"
      });
      setScanningStage('initial');
    }
  };
  
  const handleReset = () => {
    setScanningStage('initial');
    setScanProgress(0);
    setResult(null);
    setCapturedImageUrl(null);
  };

  // Render different content based on the current stage
  const renderContent = () => {
    switch (scanningStage) {
      case 'initial':
        return (
          <div className="relative w-full max-w-md mx-auto">
            <div className="aspect-[4/3] relative rounded-xl overflow-hidden shadow-xl bg-white border-2 border-diabetly-blue">
              {/* Camera feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Frame guide overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute inset-0 border-4 border-white/20"></div>
                <div className="absolute inset-[3px] border border-white/10"></div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 text-center z-20">
                <p className="text-diabetly-darkblue text-lg font-medium mb-2">
                  Поместите глаза в рамку
                </p>
                
                {user && userSubscription && (
                  <p className="text-sm mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      <Star className="h-3 w-3 mr-1" />
                      Доступно кредитов: {userSubscription.credits_remaining}
                    </span>
                  </p>
                )}
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Button
                    onClick={handleCapture}
                    size="lg"
                    className="bg-diabetly-blue hover:bg-diabetly-darkblue transition-colors shadow-md hover:shadow-lg"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Делать снимок
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        );
        
      case 'scanning':
        return (
          <div className="relative w-full max-w-md mx-auto">
            <div className="aspect-[4/3] relative rounded-xl overflow-hidden shadow-xl bg-white border-2 border-diabetly-blue">
              {/* Display the captured image */}
              {capturedImageUrl ? (
                <img 
                  src={capturedImageUrl} 
                  alt="Captured eye" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay={false}
                  playsInline
                  muted
                />
              )}
              
              {/* Frame guide overlay with scanning effect */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute inset-0 border-4 border-white/20"></div>
                <div className="absolute inset-[3px] border border-white/10"></div>
                
                {/* Scanning animation */}
                <motion.div
                  className="absolute inset-0 bg-diabetly-blue/15"
                  initial={{ y: '-100%' }}
                  animate={{ y: '100%' }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear"
                  }}
                />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-diabetly-darkblue text-white p-4 text-center z-20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p className="font-medium">Сканирование в процессе...</p>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    className="bg-white h-2 rounded-full"
                    style={{ width: `${scanProgress}%` }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/70">Не двигайтесь во время сканирования</p>
              </div>
            </div>
          </div>
        );
        
      case 'processing':
        return (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-diabetly-skyblue/20">
              <div className="mx-auto w-20 h-20 mb-6 relative">
                <svg className="animate-spin w-full h-full text-diabetly-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-diabetly-lightblue" />
                </div>
              </div>
              
              <h3 className="text-xl font-medium text-diabetly-darkblue mb-2">Обработка изображения</h3>
              <p className="text-gray-600 mb-4">ИИ анализирует полученное изображение</p>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <motion.div 
                  className="bg-diabetly-blue h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3 }}
                />
              </div>
              
              <p className="text-sm text-gray-500">Это может занять несколько секунд...</p>
            </div>
          </div>
        );
        
      case 'result':
        return (
          <div className="max-w-4xl mx-auto">
            {result && (
              <AnalysisResult 
                loading={false} 
                resultData={result} 
                onReset={handleReset}
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <NavBar />
      
      <main className="flex-grow py-12 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-3 text-diabetly-darkblue">
                {scanningStage === 'result' ? 'Результаты сканирования' : 'Сканирование сетчатки глаза'}
              </h1>
              <p className="text-gray-600 max-w-md mx-auto">
                {scanningStage === 'initial' && 'Поместите свое лицо внутрь рамки для проведения анализа сетчатки глаза'}
                {scanningStage === 'scanning' && 'Идет процесс сканирования, пожалуйста, не двигайтесь'}
                {scanningStage === 'processing' && 'Обработка полученного изображения'}
                {scanningStage === 'result' && 'Анализ завершен, ознакомьтесь с результатами ниже'}
              </p>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={scanningStage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
            
            {scanningStage === 'initial' && (
              <div className="mt-8 max-w-md mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium mb-4 text-diabetly-darkblue">Рекомендации для сканирования:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-diabetly-blue/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-diabetly-blue text-xs">1</span>
                      </div>
                      <p>Убедитесь, что вы находитесь в хорошо освещенном помещении</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-diabetly-blue/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-diabetly-blue text-xs">2</span>
                      </div>
                      <p>Держите устройство на расстоянии 30-40 см от лица</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-diabetly-blue/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-diabetly-blue text-xs">3</span>
                      </div>
                      <p>Не двигайтесь во время сканирования для получения четкого изображения</p>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Scan;