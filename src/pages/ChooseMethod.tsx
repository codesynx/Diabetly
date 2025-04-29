import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Upload, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const ChooseMethod = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <NavBar />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold mb-4 text-diabetly-darkblue">
              Выберите метод анализа
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Вы можете загрузить готовое изображение или воспользоваться камерой для сканирования глаза
            </p>
          </motion.div>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-diabetly-skyblue/30">
                <CardContent className="p-0">
                  <Link to="/upload" className="block h-full">
                    <div className="p-8 flex flex-col items-center h-full">
                      <div className="w-20 h-20 rounded-full bg-diabetly-blue/10 flex items-center justify-center mb-6">
                        <Upload className="h-10 w-10 text-diabetly-blue" />
                      </div>
                      <h2 className="text-xl font-semibold mb-2 text-diabetly-darkblue">Загрузить изображение</h2>
                      <p className="text-gray-600 text-center mb-6">
                        Загрузите готовый снимок глаза с вашего устройства для анализа
                      </p>
                      <Button className="mt-auto bg-diabetly-blue hover:bg-diabetly-darkblue transition-colors">
                        Выбрать файл
                      </Button>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={item}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-diabetly-skyblue/30">
                <CardContent className="p-0">
                  <Link to="/scan" className="block h-full">
                    <div className="p-8 flex flex-col items-center h-full">
                      <div className="w-20 h-20 rounded-full bg-diabetly-blue/10 flex items-center justify-center mb-6">
                        <Camera className="h-10 w-10 text-diabetly-blue" />
                      </div>
                      <h2 className="text-xl font-semibold mb-2 text-diabetly-darkblue">Сканировать глаз</h2>
                      <p className="text-gray-600 text-center mb-6">
                        Используйте камеру вашего устройства для сканирования глаза в реальном времени
                      </p>
                      <Button className="mt-auto bg-diabetly-blue hover:bg-diabetly-darkblue transition-colors">
                        Начать сканирование
                      </Button>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChooseMethod; 