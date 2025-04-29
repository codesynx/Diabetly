import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MovingBorderDemo } from '@/components/ui/moving-border-demo';

const Info = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Информация о диабетической ретинопатии</h1>
            
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4">Что такое диабетическая ретинопатия?</h2>
                <p className="text-gray-700 mb-4">
                  Диабетическая ретинопатия — это осложнение сахарного диабета, которое поражает кровеносные сосуды сетчатки (светочувствительной ткани в задней части глаза). Это одна из ведущих причин слепоты у взрослых в развитых странах.
                </p>
                <p className="text-gray-700 mb-4">
                  Заболевание проходит через несколько стадий развития, начиная от легких аномалий и заканчивая тяжелыми изменениями, которые могут привести к необратимой потере зрения.
                </p>

                <Separator className="my-6" />
                
                <h2 className="text-2xl font-semibold mb-4">Признаки и симптомы</h2>
                <p className="text-gray-700 mb-2">
                  На ранних стадиях диабетическая ретинопатия часто протекает бессимптомно, но по мере прогрессирования могут появиться следующие симптомы:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>Точки или нити (плавающие помутнения) в поле зрения</li>
                  <li>Затуманенное зрение</li>
                  <li>Темные или пустые области в поле зрения</li>
                  <li>Ухудшение ночного зрения</li>
                  <li>Трудности с различением цветов</li>
                  <li>Потеря зрения</li>
                </ul>
                
                <Separator className="my-6" />
                
                <h2 className="text-2xl font-semibold mb-4">Причины и факторы риска</h2>
                <p className="text-gray-700 mb-2">
                  Основной причиной диабетической ретинопатии является повышенный уровень сахара в крови, который повреждает кровеносные сосуды сетчатки. Факторы риска включают:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>Продолжительность диабета (риск увеличивается со временем)</li>
                  <li>Плохой контроль уровня сахара в крови</li>
                  <li>Высокое кровяное давление</li>
                  <li>Высокий уровень холестерина</li>
                  <li>Беременность (у женщин с диабетом)</li>
                  <li>Курение</li>
                </ul>
                
                <Separator className="my-6" />
                
                <h2 className="text-2xl font-semibold mb-4">Диагностика и роль ИИ</h2>
                <p className="text-gray-700 mb-4">
                  Традиционно диабетическая ретинопатия диагностируется офтальмологом путем осмотра глазного дна после расширения зрачка и с помощью специальных исследований, таких как флуоресцентная ангиография и оптическая когерентная томография.
                </p>
                <p className="text-gray-700 mb-4">
                  В последние годы алгоритмы искусственного интеллекта показали высокую эффективность в скрининге диабетической ретинопатии, анализируя фотографии глазного дна. Использование ИИ помогает в раннем выявлении заболевания, особенно в районах с ограниченным доступом к специализированной медицинской помощи.
                </p>
                
                <div className="bg-diabetly-skyblue/20 p-6 rounded-xl my-6">
                  <h3 className="text-xl font-semibold mb-3 text-diabetly-darkblue">Важно помнить</h3>
                  <p className="text-gray-700">
                    Результаты анализа с использованием ИИ являются вспомогательным инструментом и не заменяют полноценную консультацию специалиста. При получении положительных результатов анализа или наличии симптомов необходимо обратиться к врачу для детального обследования и определения тактики лечения.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center">
              <Button 
                size="lg" 
                className="bg-diabetly-blue hover:bg-diabetly-darkblue"
                asChild
              >
                <Link to="/upload">
                  Пройти анализ
                </Link>
              </Button>
            </div>
            

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Info;
