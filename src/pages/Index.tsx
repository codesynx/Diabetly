import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import HowItWorks from '@/components/HowItWorks';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";

// Floating Paths Component for CTA section
function FloatingPathsCTA({ position, color }: { position: number, color: string }) {
  const paths = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    opacity: 0.08 + i * 0.015,
    width: 0.8 + i * 0.05,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 696 516"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={color}
            strokeWidth={path.width}
            strokeOpacity={path.opacity}
            initial={{ pathLength: 0.3, opacity: 0.5 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

// Testimonial Component
interface TestimonialProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  role: string;
  company?: string;
  testimonial: string;
  rating?: number;
  image?: string;
}

const Testimonial = React.forwardRef<HTMLDivElement, TestimonialProps>(
  ({ name, role, company, testimonial, rating = 5, image, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-primary/10 bg-white/90 backdrop-blur-sm p-6 transition-all hover:shadow-lg hover:-translate-y-1 md:p-8",
          className
        )}
        {...props}
      >
        <div className="absolute right-6 top-6 text-6xl font-serif text-diabetly-blue/20">
          "
        </div>

        <div className="flex flex-col gap-4 justify-between h-full">
          {rating > 0 && (
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  className={cn(
                    index < rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>
          )}

          <p className="text-pretty text-base text-gray-600">
            {testimonial}
          </p>

          <div className="flex items-center gap-4 justify-start">
            <div className="flex items-center gap-4">
              {image && (
                <Avatar>
                  <AvatarImage src={image} alt={name} height={48} width={48} />
                  <AvatarFallback>{name[0]}</AvatarFallback>
                </Avatar>
              )}

              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-900">{name}</h3>
                <p className="text-sm text-gray-600">
                  {role}
                  {company && ` @ ${company}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
Testimonial.displayName = "Testimonial";

// Testimonials data
const testimonials = [
  {
    name: "Марина Петрова",
    role: "Эндокринолог",
    company: "Городская клиника №2",
    testimonial: "Diabetly значительно упростил раннюю диагностику диабетической ретинопатии. Инструмент точен и экономит время как для врачей, так и для пациентов.",
    rating: 5,
    image: "/testimonials/doctor1.jpg"
  },
  {
    name: "Алексей Соколов",
    role: "Пациент",
    testimonial: "Благодаря Diabetly у меня обнаружили ранние признаки диабетической ретинопатии, что позволило начать лечение своевременно. Это, возможно, спасло мое зрение.",
    rating: 5,
    image: "/testimonials/patient1.jpg"
  },
  {
    name: "Елена Ковалева",
    role: "Офтальмолог",
    company: "Медицинский центр 'Здоровье'",
    testimonial: "Впечатляющая точность и удобный интерфейс. Использую Diabetly как вспомогательный инструмент при диагностике и получаю надежные результаты.",
    rating: 4,
    image: "/testimonials/doctor2.jpg"
  }
];

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <NavBar />
      
      <main className="flex-grow">
        <HeroSection />
        
        <FeatureSection />
        
        <HowItWorks />
        
        {/* Testimonials Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 tracking-tight">Что говорят о нас</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                Отзывы врачей и пациентов, которые уже оценили преимущества Diabetly
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: index * 0.1 }}
                >
                  <Testimonial 
                    name={testimonial.name}
                    role={testimonial.role}
                    company={testimonial.company}
                    testimonial={testimonial.testimonial}
                    rating={testimonial.rating}
                    image={testimonial.image}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-28 bg-gradient-to-br from-diabetly-blue to-diabetly-darkblue text-white text-center relative overflow-hidden">
          {/* Background Paths */}
          <div className="absolute inset-0 opacity-60">
            <FloatingPathsCTA position={1} color="white" />
            <FloatingPathsCTA position={-0.8} color="white" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Готовы начать анализ?</h2>
              <p className="text-xl mb-10 mx-auto font-light leading-relaxed opacity-90">
                Загрузите снимок сетчатки глаза прямо сейчас и получите результат в течение нескольких минут
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="inline-block relative bg-gradient-to-b from-white/20 to-white/5 p-px rounded-xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Button 
                    size="lg" 
                    className="bg-white/90 backdrop-blur-sm text-diabetly-blue hover:bg-white/100 transition-all rounded-xl shadow-lg border border-white/10"
                    asChild
                  >
                    <Link to="/choose-method" className="px-10 py-7 text-lg font-medium flex items-center">
                      Начать анализ
                      <span className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300">→</span>
                    </Link>
                  </Button>
                </div>
              </motion.div>
              
              <div className="mt-16 pt-8 border-t border-white/20 text-sm font-light opacity-80">
                <p>Все данные обрабатываются в соответствии с нашей политикой конфиденциальности</p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
