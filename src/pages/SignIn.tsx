import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { signIn } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeIcon, EyeOffIcon, LoaderCircle, Mail, Lock } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  
  // Get the return path from location state, or default to account
  const from = location.state?.from?.pathname || '/account';
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Ошибка авторизации',
        description: 'Пожалуйста, введите email и пароль',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { user, session, error } = await signIn(email, password);
      
      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: 'Ошибка авторизации',
          description: error.message || 'Не удалось выполнить вход',
          variant: 'destructive',
        });
        return;
      }
      
      if (session) {
        console.log('Successfully signed in:', session.user.email);
        
        // Refresh auth context to make sure it has the latest user data
        await refreshUser();
        
        toast({
          title: 'Успешная авторизация',
          description: 'Вы успешно вошли в систему',
        });
        
        // Redirect to the return path or account page
        navigate(from, { replace: true });
      } else {
        console.error('No session after sign in');
        toast({
          title: 'Ошибка авторизации',
          description: 'Не удалось получить сессию после входа',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      toast({
        title: 'Ошибка авторизации',
        description: 'Произошла неизвестная ошибка',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <NavBar />
      
      <div className="flex-grow flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Вход в аккаунт</CardTitle>
            <CardDescription className="text-center">
              Введите свои данные для входа в систему
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-diabetly-blue hover:bg-diabetly-darkblue"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Выполняется вход...
                  </>
                ) : (
                  'Войти'
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-600">
              Еще нет аккаунта?{' '}
              <Link to="/signup" className="text-diabetly-blue hover:underline">
                Зарегистрироваться
              </Link>
            </div>
            
            <div className="text-sm text-center text-gray-600">
              <Link to="/forgot-password" className="text-diabetly-blue hover:underline">
                Забыли пароль?
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default SignIn; 