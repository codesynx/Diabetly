import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    title: "Точный анализ снимков",
    description: "Наш алгоритм ИИ с высокой точностью анализирует снимки сетчатки глаза и выявляет признаки диабетической ретинопатии."
  },
  {
    title: "Быстрые результаты",
    description: "Получите результаты анализа в течение нескольких минут прямо на сайте."
  },
  {
    title: "Раннее выявление",
    description: "Выявление признаков диабета на ранних стадиях, когда лечение наиболее эффективно."
  },
  {
    title: "Простой интерфейс",
    description: "Интуитивно понятный интерфейс делает процесс загрузки и анализа снимков максимально простым."
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const FeatureSection = () => {
  return (
    <section className="py-24 bg-gray-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 tracking-tight">Преимущества Diabetly</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Наша платформа использует передовые технологии для анализа снимков сетчатки глаза
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500"
              variants={item}
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.1)", 
                y: -5 
              }}
            >
              <div className="flex items-start">
                <motion.div 
                  className="flex-shrink-0 mt-1"
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 300, damping: 10, delay: index * 0.1 + 0.3 }}
                >
                  <div className="rounded-full bg-diabetly-blue/10 p-3">
                    <CheckCircle className="h-6 w-6 text-diabetly-blue" />
                  </div>
                </motion.div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-light">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;
