import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, LoaderCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { verifyPayment } from '@/lib/payment-service';

const PaymentSuccess = () => {
  const [verifying, setVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const { refreshSubscription, userSubscription } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true; // Track component mount state
    
    const checkPayment = async () => {
      // Skip if we've already attempted verification
      if (!isMounted || verificationAttempted) return;
      
      setVerifying(true);
      setVerificationAttempted(true); // Mark verification as attempted

      try {
        // Parse session_id from URL
        const params = new URLSearchParams(location.search);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          const errorMsg = 'Не удалось найти идентификатор сессии оплаты в URL';
          setErrorMessage(errorMsg);
          toast({
            title: 'Ошибка проверки оплаты',
            description: errorMsg,
            variant: 'destructive',
          });
          if (isMounted) {
            setVerificationSuccess(false);
            setVerifying(false);
          }
          return;
        }

        console.log('Verifying payment with session ID:', sessionId);

        // Verify payment with backend
        const success = await verifyPayment(sessionId);

        if (success) {
          console.log('Payment verification successful');
          
          // Refresh user subscription data and wait for completion
          await refreshSubscription();
          
          if (isMounted) {
            setVerificationSuccess(true);
            setVerifying(false);
            
            toast({
              title: 'Оплата успешна',
              description: 'Ваш план был успешно активирован',
            });
          }
        } else {
          const errorMsg = 'Оплата не подтверждена системой Stripe или не удалось добавить кредиты. Если вы произвели оплату, пожалуйста, свяжитесь с поддержкой.';
          if (isMounted) {
            setErrorMessage(errorMsg);
            setVerificationSuccess(false);
            setVerifying(false);
            
            toast({
              title: 'Ошибка проверки оплаты',
              description: errorMsg,
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        const errorMsg = error instanceof Error 
          ? `Ошибка: ${error.message}` 
          : 'Неизвестная ошибка при проверке оплаты';
        
        if (isMounted) {
          setErrorMessage(errorMsg);
          setVerificationSuccess(false);
          setVerifying(false);
          
          toast({
            title: 'Ошибка проверки оплаты',
            description: errorMsg,
            variant: 'destructive',
          });
        }
      }
    };

    checkPayment();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [location.search, toast, refreshSubscription, verificationAttempted]);

  // Force display success if we have userSubscription - only if we haven't already verified
  useEffect(() => {
    if (userSubscription && userSubscription.credits_remaining > 0 && verifying) {
      setVerificationSuccess(true);
      setVerifying(false);
    }
  }, [userSubscription, verifying]);

  // If verification is still running after 15 seconds, check if we have credits
  // and switch to success state if we do
  useEffect(() => {
    if (verifying) {
      const timer = setTimeout(() => {
        if (userSubscription && userSubscription.credits_remaining > 0) {
          console.log('Payment verification timed out but credits exist, showing success');
          setVerificationSuccess(true);
          setVerifying(false);
        }
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, [verifying, userSubscription]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <NavBar />

      <main className="flex-grow flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4 shadow-lg">
          <CardHeader className="text-center">
            {verifying ? (
              <>
                <CardTitle className="text-2xl font-bold">Проверка оплаты</CardTitle>
                <CardDescription>
                  Пожалуйста, подождите, мы проверяем статус вашей оплаты
                </CardDescription>
              </>
            ) : verificationSuccess ? (
              <>
                <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-600">Оплата успешна!</CardTitle>
                <CardDescription>
                  Ваш план активирован, и вы можете начать использовать систему.
                </CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-red-600">Ошибка проверки оплаты</CardTitle>
                <CardDescription>
                  К сожалению, мы не смогли подтвердить статус вашей оплаты.
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="text-center">
            {verifying ? (
              <div className="flex flex-col items-center justify-center py-8">
                <LoaderCircle className="h-12 w-12 text-diabetly-blue animate-spin mb-4" />
                <p className="text-gray-600">Проверяем статус оплаты...</p>
                {userSubscription && (
                  <Button 
                    className="mt-8 bg-diabetly-blue hover:bg-diabetly-darkblue"
                    onClick={() => {
                      setVerifying(false);
                      setVerificationSuccess(true);
                    }}
                  >
                    Продолжить
                  </Button>
                )}
              </div>
            ) : verificationSuccess ? (
              <div className="py-4">
                <p className="text-gray-700">
                  Спасибо за покупку! Теперь вы можете использовать систему для анализа сетчатки глаза.
                </p>
                {userSubscription && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md text-blue-700">
                    <p className="font-semibold">Доступные кредиты: {userSubscription.credits_remaining}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4">
                <p className="text-gray-700 mb-4">
                  Если вы произвели оплату, но видите это сообщение, пожалуйста, свяжитесь с нашей
                  службой поддержки, предоставив данные о вашей оплате.
                </p>
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600 text-left">
                    <p className="font-semibold mb-1">Детали ошибки:</p>
                    <p>{errorMessage}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            {!verifying && (
              verificationSuccess ? (
                <Button 
                  className="bg-diabetly-blue hover:bg-diabetly-darkblue"
                  onClick={() => navigate('/choose-method')}
                >
                  Перейти к анализу <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate('/purchase-credits')}
                  >
                    Вернуться к выбору плана
                  </Button>
                  <Button 
                    className="flex-1 bg-diabetly-blue hover:bg-diabetly-darkblue"
                    onClick={() => {
                      window.location.href = "mailto:support@diabetly.com?subject=Проблема с оплатой";
                    }}
                  >
                    Связаться с поддержкой
                  </Button>
                </div>
              )
            )}
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;