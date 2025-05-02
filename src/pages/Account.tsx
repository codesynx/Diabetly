import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, LogOut, User, Star, History, AlertCircle, ArrowRight } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { CREDIT_PLANS } from '@/lib/user-credits-service';

const Account = () => {
  const { user, userSubscription, signOutUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({
        title: 'Выход выполнен',
        description: 'Вы успешно вышли из системы',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выйти из системы',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return null; // Return early if not authenticated
  }

  // Get plan details if user has subscription
  const planType = userSubscription?.plan_type || null;
  const planDetails = planType === 'one_time' 
    ? CREDIT_PLANS.ONE_TIME 
    : planType === 'family' 
      ? CREDIT_PLANS.FAMILY 
      : null;

  // Calculate credit usage percentage
  const creditsTotal = planType === 'one_time' 
    ? CREDIT_PLANS.ONE_TIME.credits 
    : planType === 'family' 
      ? CREDIT_PLANS.FAMILY.credits 
      : 0;
  
  const creditsRemaining = userSubscription?.credits_remaining || 0;
  // Calculate used credits correctly
  let creditsUsed = Math.max(0, creditsTotal - creditsRemaining);
  
  // Handle case where user has more credits than the plan's original amount
  // This happens if user bought multiple plans or received extra credits
  if (creditsRemaining > creditsTotal) {
    // If they have more credits than original plan, show 0 used out of total+remaining
    creditsUsed = 0;
    // We don't modify creditsTotal here to keep the plan consistent
  }
  
  const creditUsagePercentage = creditsTotal > 0 ? (creditsUsed / creditsTotal) * 100 : 0;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <NavBar />

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
            {/* Left column: Account info */}
            <div className="w-full md:w-1/3">
              <Card className="shadow-md h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" /> Аккаунт
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">ID пользователя</p>
                    <p className="font-medium text-xs truncate">{user.id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Статус аккаунта</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      {user.email_confirmed_at ? 'Подтвержден' : 'Не подтвержден'}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Выйти
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Right column: Credits and plan info */}
            <div className="w-full md:w-2/3 space-y-6">
              {/* Credits card */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-5 w-5" /> Кредиты для анализа
                  </CardTitle>
                  <CardDescription>
                    Информация о ваших доступных кредитах для анализа сетчатки глаза
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {userSubscription ? (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold">{userSubscription.credits_remaining}</p>
                          <p className="text-sm text-gray-500">Доступных кредитов</p>
                        </div>

                        <Badge 
                          className={`text-sm ${
                            planType === 'family' 
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' 
                              : 'bg-green-100 text-green-800 hover:bg-green-100'
                          }`}
                        >
                          {planType === 'one_time' ? 'Разовый анализ' : 'Семейный план'}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Использовано кредитов</span>
                          <span>
                            {creditsUsed} из {creditsRemaining > creditsTotal ? creditsRemaining : creditsTotal}
                          </span>
                        </div>
                        <Progress value={creditUsagePercentage} className="h-2" />
                      </div>

                      {userSubscription.credits_remaining === 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start">
                          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-amber-800 font-medium">У вас закончились кредиты</p>
                            <p className="text-amber-700 text-sm">Для продолжения использования сервиса необходимо приобрести новые кредиты</p>
                            <Button 
                              size="sm" 
                              className="mt-2 bg-amber-500 hover:bg-amber-600"
                              onClick={() => navigate('/purchase-credits')}
                            >
                              Приобрести кредиты
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
                      <p className="text-gray-700 mb-4">У вас пока нет активного плана</p>
                      <Button 
                        className="bg-diabetly-blue hover:bg-diabetly-darkblue"
                        onClick={() => navigate('/purchase-credits')}
                      >
                        <CreditCard className="mr-2 h-4 w-4" /> Приобрести кредиты
                      </Button>
                    </div>
                  )}
                </CardContent>
                {userSubscription && userSubscription.credits_remaining > 0 && (
                  <CardFooter className="flex justify-end">
                    <Button 
                      onClick={() => navigate('/choose-method')}
                      className="bg-diabetly-blue hover:bg-diabetly-darkblue"
                    >
                      Начать анализ <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                )}
              </Card>

              {/* History link card */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <History className="mr-2 h-5 w-5" /> История анализов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Просмотрите историю ваших предыдущих анализов и результаты исследований.</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/history')}
                  >
                    Перейти к истории анализов
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account; 