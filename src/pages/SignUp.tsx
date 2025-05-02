import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeIcon, EyeOffIcon, LoaderCircle, Mail, Lock, User } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password || !confirmPassword) {
      toast({
        title: 'Ошибка регистрации',
        description: 'Пожалуйста, заполните все поля',
        variant: 'destructive',
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Ошибка регистрации',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: 'Ошибка регистрации',
        description: 'Пароль должен содержать минимум 6 символов',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { user, error } = await signUp(email, password);
      
      if (error) {
        toast({
          title: 'Ошибка регистрации',
          description: error.message || 'Не удалось создать аккаунт',
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Регистрация успешна',
        description: 'Пожалуйста, проверьте вашу почту для подтверждения аккаунта',
      });
      
      // Redirect to sign in or confirmation page
      navigate('/signin');
    } catch (error) {
      toast({
        title: 'Ошибка регистрации',
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
            <CardTitle className="text-2xl font-bold text-center">Создание аккаунта</CardTitle>
            <CardDescription className="text-center">
              Введите данные для регистрации в системе
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
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
                    placeholder="Минимум 6 символов"
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
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Повторите пароль"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
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
                    Регистрация...
                  </>
                ) : (
                  'Зарегистрироваться'
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="text-sm text-center text-gray-600">
            Уже есть аккаунт?{' '}
            <Link to="/signin" className="text-diabetly-blue hover:underline">
              Войти
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default SignUp; 