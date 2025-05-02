import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, CreditCard, LoaderCircle } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { CREDIT_PLANS } from '@/lib/user-credits-service';
import { createCheckoutSession, redirectToCheckout } from '@/lib/payment-service';

const PurchaseCredits = () => {
  const [selectedPlan, setSelectedPlan] = useState<'one_time' | 'family' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, refreshSubscription } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle plan selection and checkout
  const handlePurchase = async () => {
    if (!selectedPlan) {
      toast({
        title: 'Выберите план',
        description: 'Пожалуйста, выберите план перед продолжением',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Пожалуйста, войдите в систему для покупки кредитов',
        variant: 'destructive',
      });
      navigate('/signin');
      return;
    }

    setIsLoading(true);

    try {
      // Create checkout session with proper URL format for the success URL
      const session = await createCheckoutSession({
        planType: selectedPlan,
        successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/purchase-credits`,
        customerEmail: user.email,
        userId: user.id
      });

      if (!session || !session.id) {
        throw new Error('Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      await redirectToCheckout(session.id);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Ошибка оплаты',
        description: 'Не удалось создать сессию оплаты. Пожалуйста, попробуйте еще раз.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <NavBar />

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Приобретение кредитов для анализа</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Выберите подходящий вам план и получите доступ к ИИ-анализу сетчатки глаза
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* One-time plan */}
            <Card 
              className={`border-2 transition-all ${
                selectedPlan === 'one_time' 
                  ? 'border-diabetly-blue shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-diabetly-blue/50 hover:shadow-md'
              }`}
              onClick={() => setSelectedPlan('one_time')}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{CREDIT_PLANS.ONE_TIME.name}</CardTitle>
                <CardDescription>
                  {CREDIT_PLANS.ONE_TIME.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-diabetly-blue">₸{CREDIT_PLANS.ONE_TIME.PriceTG}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {CREDIT_PLANS.ONE_TIME.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className={`w-full mt-6 ${
                    selectedPlan === 'one_time' ? 'bg-diabetly-blue text-white hover:bg-diabetly-darkblue' : ''
                  }`}
                  onClick={() => setSelectedPlan('one_time')}
                >
                  {selectedPlan === 'one_time' ? 'Выбрано' : 'Выбрать'}
                </Button>
              </CardContent>
            </Card>

            {/* Family plan */}
            <Card 
              className={`border-2 transition-all ${
                selectedPlan === 'family' 
                  ? 'border-diabetly-blue shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-diabetly-blue/50 hover:shadow-md'
              }`}
              onClick={() => setSelectedPlan('family')}
            >
              <CardHeader className="text-center">
                <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-2">
                  Экономия 33%
                </div>
                <CardTitle className="text-2xl">{CREDIT_PLANS.FAMILY.name}</CardTitle>
                <CardDescription>
                  {CREDIT_PLANS.FAMILY.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-diabetly-blue">₸{CREDIT_PLANS.FAMILY.PriceTG}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    (₸{Math.round(CREDIT_PLANS.FAMILY.PriceTG / CREDIT_PLANS.FAMILY.credits)} за анализ)
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {CREDIT_PLANS.FAMILY.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className={`w-full mt-6 ${
                    selectedPlan === 'family' ? 'bg-diabetly-blue text-white hover:bg-diabetly-darkblue' : ''
                  }`}
                  onClick={() => setSelectedPlan('family')}
                >
                  {selectedPlan === 'family' ? 'Выбрано' : 'Выбрать'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center mt-12">
            <Button 
              className="bg-diabetly-blue hover:bg-diabetly-darkblue px-10 py-6 text-lg"
              onClick={handlePurchase}
              disabled={!selectedPlan || isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Оплатить
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PurchaseCredits; 