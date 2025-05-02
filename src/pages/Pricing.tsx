import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';

interface PricingPlan {
  name: string;
  description: string;
  price: string;
  billingPeriod: string;
  features: string[];
  credits: number;
  recommended?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Базовый",
    description: "Идеально для начинающих пользователей",
    price: "7800",
    billingPeriod: "разовая оплата",
    credits: 5,
    features: [
      "5 кредитов для сканирования",
      "Базовые отчеты",
      "Срок действия 3 месяца",
      "Доступ к истории анализов",
    ]
  },
  {
    name: "Стандарт",
    description: "Оптимальное решение для регулярного использования",
    price: "25800",
    billingPeriod: "разовая оплата",
    credits: 15,
    recommended: true,
    features: [
      "15 кредитов для сканирования",
      "Расширенные отчеты",
      "Срок действия 6 месяцев",
      "Приоритетная обработка",
      "Доступ к AI-консультации",
      "Возможность экспорта данных",
    ]
  },
  {
    name: "Премиум",
    description: "Максимальные возможности для профессионалов",
    price: "45800",
    billingPeriod: "разовая оплата",
    credits: 30,
    features: [
      "30 кредитов для сканирования",
      "Премиум отчеты с детальным анализом",
      "Срок действия 12 месяцев",
      "Приоритетная обработка",
      "Неограниченный доступ к AI-консультации",
      "Расширенные возможности экспорта",
      "Персональная поддержка",
    ]
  }
];

const Pricing = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <NavBar />
      
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
              Простые и прозрачные тарифы
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              Выберите план, который подходит вашим потребностям, и начните пользоваться преимуществами Diabetly уже сегодня.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div 
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                className="flex"
              >
                <Card className={`flex flex-col justify-between w-full border rounded-xl overflow-hidden ${
                  plan.recommended ? 'relative border-2 border-diabetly-blue shadow-md' : 'border-gray-200'
                }`}>
                  {plan.recommended && (
                    <div className="absolute top-0 inset-x-0 bg-diabetly-blue text-white text-center text-sm py-1">
                      Рекомендуемый план
                    </div>
                  )}
                  
                  <CardHeader className={plan.recommended ? 'pt-8' : ''}>
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-500 min-h-12">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <div className="mb-6">
                      <span className="text-4xl font-bold">₸{plan.price}</span>
                      <span className="text-gray-500 text-sm ml-1">/ {plan.billingPeriod}</span>
                    </div>
                    
                    <div className="flex items-center mb-6">
                      <Star className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="font-semibold">{plan.credits} кредитов</span>
                    </div>
                    
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    {user ? (
                      <Button 
                        className={`w-full ${
                          plan.recommended 
                            ? 'bg-diabetly-blue hover:bg-diabetly-darkblue' 
                            : ''
                        }`} 
                        asChild
                      >
                        <Link to="/purchase-credits">
                          Приобрести
                        </Link>
                      </Button>
                    ) : (
                      <Button 
                        className={`w-full ${
                          plan.recommended 
                            ? 'bg-diabetly-blue hover:bg-diabetly-darkblue' 
                            : ''
                        }`} 
                        asChild
                      >
                        <Link to="/signin?redirect=purchase-credits">
                          Войти для приобретения
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Остались вопросы?</h2>
            <p className="text-gray-600 mb-6">
              Если у вас есть вопросы о наших планах или вам нужна помощь в выборе подходящего тарифа, свяжитесь с нашей службой поддержки.
            </p>
            <Button variant="outline" asChild>
              <a href="mailto:support@diabetly.com">Связаться с поддержкой</a>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing; 