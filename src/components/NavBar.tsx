import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md py-3">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/207f26bc-b839-4183-8783-e4e577d8f978.png" 
                alt="Diabetly Logo" 
                className="h-10 w-10 mr-2"
              />
              <span className="text-diabetly-blue font-semibold text-xl">Diabetly</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-diabetly-blue transition-colors">
              Главная
            </Link>
            <Link to="/choose-method" className="text-gray-700 hover:text-diabetly-blue transition-colors">
              Анализ
            </Link>
            <Link to="/history" className="text-gray-700 hover:text-diabetly-blue transition-colors">
              История
            </Link>
            <Link to="/info" className="text-gray-700 hover:text-diabetly-blue transition-colors">
              Информация
            </Link>
            <Button 
              className="bg-diabetly-blue hover:bg-diabetly-darkblue text-white" 
              asChild
            >
              <Link to="/choose-method">
                <Eye className="mr-2 h-4 w-4" /> Начать анализ
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-diabetly-blue hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Главная
            </Link>
            <Link 
              to="/choose-method" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-diabetly-blue hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Анализ
            </Link>
            <Link 
              to="/history" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-diabetly-blue hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <History className="h-4 w-4 inline mr-1" /> История
            </Link>
            <Link 
              to="/info" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-diabetly-blue hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Информация
            </Link>
            <Button 
              className="w-full bg-diabetly-blue hover:bg-diabetly-darkblue text-white mt-2" 
              asChild
              onClick={() => setIsMenuOpen(false)}
            >
              <Link to="/choose-method">
                <Eye className="mr-2 h-4 w-4" /> Начать анализ
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
