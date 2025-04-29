import { Eye, Search, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: <Eye className="h-10 w-10 text-diabetly-blue" />,
    title: "Загрузите снимок",
    description: "Загрузите чёткий и качественный снимок сетчатки глаза, сделанный на камеру телефона."
  },
  {
    icon: <Search className="h-10 w-10 text-diabetly-blue" />,
    title: "ИИ проводит анализ",
    description: "Наш алгоритм искусственного интеллекта анализирует изображение, выявляя признаки диабетической ретинопатии."
  },
  {
    icon: <FileText className="h-10 w-10 text-diabetly-blue" />,
    title: "Получите результаты",
    description: "Получите детальный отчет с результатами анализа и рекомендациями для дальнейших действий."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const iconContainerVariants = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10,
      delay: 0.2
    }
  }
};

const HowItWorks = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 tracking-tight">Как это работает</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Простой процесс в три шага для анализа снимков сетчатки глаза
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              className="bg-gray-50/70 p-10 rounded-3xl shadow-[0_15px_35px_-15px_rgba(0,0,0,0.08)] border border-gray-100/80 backdrop-blur-sm flex flex-col items-center text-center relative"
              variants={itemVariants}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 25px 40px -15px rgba(0, 0, 0, 0.1)",
                background: "rgba(255, 255, 255, 0.8)"
              }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <motion.div 
                className="bg-diabetly-skyblue/20 p-5 rounded-full mb-8 ring-2 ring-diabetly-skyblue/30 ring-offset-2 ring-offset-gray-50"
                variants={iconContainerVariants}
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {step.icon}
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Шаг {index + 1}: {step.title}</h3>
              <p className="text-gray-600 leading-relaxed font-light">{step.description}</p>
              
              {index < steps.length - 1 && (
                <motion.div 
                  className="hidden md:flex absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white shadow-lg"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.3 + 0.6 }}
                >
                  <svg className="h-5 w-5 text-diabetly-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
