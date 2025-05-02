import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, History, MessageCircle, Star, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userSubscription, signOutUser, refreshUser } = useAuth();

  // Refresh user data when component mounts
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Function to get first letter of email for avatar
  const getInitial = (email: string | undefined) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md py-3">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {user ? (
          // Authenticated user layout
          <div className="grid grid-cols-3 items-center">
            {/* Logo on the left */}
            <div className="flex items-center">
              <Link to="/index" className="flex items-center">
                <img 
                  src="/lovable-uploads/207f26bc-b839-4183-8783-e4e577d8f978.png" 
                  alt="Diabetly Logo" 
                  className="h-10 w-10 mr-2"
                />
                <span className="text-diabetly-blue font-semibold text-xl">Diabetly</span>
              </Link>
            </div>

            {/* Desktop Menu for authenticated users - centered */}
            <div className="hidden md:flex justify-center items-center space-x-4 lg:space-x-6">
              <Link to="/index" className="text-gray-700 hover:text-diabetly-blue transition-colors whitespace-nowrap">
                Главная
              </Link>
              <Link to="/choose-method" className="text-gray-700 hover:text-diabetly-blue transition-colors whitespace-nowrap">
                Анализ
              </Link>
              <Link to="/history" className="text-gray-700 hover:text-diabetly-blue transition-colors whitespace-nowrap">
                История
              </Link>
              <Link to="/chat" className="text-gray-700 hover:text-diabetly-blue transition-colors whitespace-nowrap">
                AI-консультация
              </Link>
              <Link to="/info" className="text-gray-700 hover:text-diabetly-blue transition-colors whitespace-nowrap">
                Информация
              </Link>
            </div>
              
            {/* User account section - aligned right */}
            <div className="flex justify-end items-center">
              <div className="hidden md:flex items-center gap-3">
                {/* Credits display */}
                {userSubscription && (
                  <Link to="/account">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 cursor-pointer">
                      <Star className="h-3.5 w-3.5 mr-1" />
                      {userSubscription.credits_remaining} кредитов
                    </Badge>
                  </Link>
                )}

                {/* User avatar and dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-gray-200 transition-all">
                      <AvatarFallback className="bg-diabetly-blue text-white">
                        {getInitial(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Профиль</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/history" className="cursor-pointer">
                        <History className="mr-2 h-4 w-4" />
                        <span>История анализов</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/purchase-credits" className="cursor-pointer">
                        <Star className="mr-2 h-4 w-4" />
                        <span>Приобрести кредиты</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600 cursor-pointer" 
                      onClick={handleSignOut}
                    >
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
        ) : (
          // Unauthenticated user layout - three-column grid for proper centering
          <div className="grid grid-cols-3 items-center">
            {/* Logo on the left */}
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
            
            {/* Centered navigation links - only visible on desktop */}
            <div className="hidden md:flex justify-center items-center space-x-8 lg:space-x-12">
              <Link to="/" className="text-diabetly-blue hover:text-diabetly-darkblue transition-colors font-medium whitespace-nowrap">
                Главная
              </Link>
              <Link to="/info" className="text-diabetly-blue hover:text-diabetly-darkblue transition-colors font-medium whitespace-nowrap">
                Информация
              </Link>
              <Link to="/pricing" className="text-diabetly-blue hover:text-diabetly-darkblue transition-colors font-medium whitespace-nowrap">
                Цены
              </Link>
            </div>
            
            {/* Auth buttons on the right */}
            <div className="flex justify-end">
              {/* For desktop */}
              <div className="hidden md:flex items-center gap-3">
                <Button variant="outline" asChild>
                  <Link to="/signin">
                    <LogIn className="mr-2 h-4 w-4" /> Войти
                  </Link>
                </Button>
                <Button className="bg-diabetly-blue hover:bg-diabetly-darkblue text-white" asChild>
                  <Link to="/signup">
                    Регистрация
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
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {user ? (
              /* Authenticated user: regular menu layout */
              <>
                <Link 
                  to="/index" 
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
                  to="/chat" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-diabetly-blue hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageCircle className="h-4 w-4 inline mr-1" /> AI-консультация
                </Link>
                <Link 
                  to="/info" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-diabetly-blue hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Информация
                </Link>
              </>
            ) : (
              /* Unauthenticated user: centered menu */
              <div className="flex flex-col items-center space-y-4 pt-4 pb-2">
                <Link 
                  to="/" 
                  className="block px-5 py-2 rounded-md text-lg font-semibold text-diabetly-blue hover:bg-diabetly-blue/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Главная
                </Link>
                <Link 
                  to="/info" 
                  className="block px-5 py-2 rounded-md text-lg font-semibold text-diabetly-blue hover:bg-diabetly-blue/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Информация
                </Link>
                <Link 
                  to="/pricing" 
                  className="block px-5 py-2 rounded-md text-lg font-semibold text-diabetly-blue hover:bg-diabetly-blue/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Цены
                </Link>
              </div>
            )}
            
            {/* Authentication for mobile */}
            {user ? (
              <>
                {/* User info */}
                <div className="block px-3 py-2 border-t border-gray-200 mt-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-diabetly-blue text-white">
                        {getInitial(user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.email}</div>
                      {userSubscription && (
                        <div className="text-sm text-gray-500">
                          {userSubscription.credits_remaining} кредитов
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Account links */}
                <Link 
                  to="/account" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-diabetly-blue hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4 inline mr-1" /> Профиль
                </Link>
                <Link 
                  to="/purchase-credits" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-diabetly-blue hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Star className="h-4 w-4 inline mr-1" /> Приобрести кредиты
                </Link>
                <button
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Выйти
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 px-3 py-4 border-t border-gray-200 mt-2">
                <Button variant="outline" className="w-full md:w-auto" asChild onClick={() => setIsMenuOpen(false)}>
                  <Link to="/signin">
                    <LogIn className="mr-2 h-4 w-4" /> Войти
                  </Link>
                </Button>
                <Button className="bg-diabetly-blue hover:bg-diabetly-darkblue text-white w-full md:w-auto" asChild onClick={() => setIsMenuOpen(false)}>
                  <Link to="/signup">
                    Регистрация
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
