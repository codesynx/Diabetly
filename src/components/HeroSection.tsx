import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Typewriter } from '../components/text';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Floating Paths Component
function FloatingPaths({ position, color }: { position: number, color: string }) {
  const paths = Array.from({ length: 22 }, (_, i) => ({
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
        <title>Background Paths</title>
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

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-br from-diabetly-blue to-diabetly-darkblue text-white py-28 relative overflow-hidden">
      {/* Background Paths */}
      <div className="absolute inset-0 opacity-60">
        <FloatingPaths position={1} color="white" />
        <FloatingPaths position={-1} color="white" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <Typewriter 
                text="Раннее выявление диабета через анализ сетчатки глаза с помощью ИИ"
                speed={40}
                initialDelay={300}
                showCursor={true}
                loop={false}
                cursorChar="▎"
                cursorClassName="text-white/70 ml-1"
              />
            </h1>
            <p className="text-xl leading-relaxed opacity-90 font-light">
              Diabetly использует передовые технологии искусственного интеллекта для анализа снимков сетчатки глаза с целью выявления признаков диабетической ретинопатии.
            </p>
            
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-3">
                <Avatar className="border-2 border-diabetly-blue h-12 w-12">
                  <AvatarImage src="/testimonials/doctor1.jpg" alt="Doctor" />
                  <AvatarFallback>DR</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-diabetly-blue h-12 w-12">
                  <AvatarImage src="/testimonials/doctor2.jpg" alt="Doctor" />
                  <AvatarFallback>DR</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-diabetly-blue h-12 w-12">
                  <AvatarImage src="/testimonials/patient1.jpg" alt="Patient" />
                  <AvatarFallback>PT</AvatarFallback>
                </Avatar>
              </div>
              <p className="text-sm font-medium text-white/90">
                Более <span className="font-bold">500+</span> медицинских специалистов доверяют нашей технологии
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-5 pt-4">
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
                    <Link to="/choose-method" className="px-8 py-6 flex items-center gap-3">
                      <Eye className="h-5 w-5" /> 
                      <span className="font-medium">Начать анализ</span>
                      <span className="ml-1 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</span>
                    </Link>
                  </Button>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 backdrop-blur-sm rounded-xl"
                  asChild
                >
                  <Link to="/info" className="px-8 py-6">
                    <span className="font-medium">Узнать больше</span>
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
          <motion.div 
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.25)] border border-white/20"
              whileHover={{ 
                y: -10, 
                boxShadow: "0 35px 60px -15px rgba(0,0,0,0.4)",
                borderColor: "rgba(255,255,255,0.3)"
              }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <img
                src="/main.png"
                alt="Анализ сетчатки глаза"
                className="w-full max-w-sm h-auto rounded-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
