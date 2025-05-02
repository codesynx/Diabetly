import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { apiService } from '@/lib/api-service';

interface ApiStatusProps {
  className?: string;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ className }) => {
  const [status, setStatus] = useState<'loading' | 'healthy' | 'unhealthy'>('loading');
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  // Check API health when component mounts
  useEffect(() => {
    checkApiHealth();

    // Set up a timer to check API health every 60 seconds
    const timer = setInterval(() => {
      checkApiHealth();
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const checkApiHealth = async () => {
    try {
      const healthData = await apiService.checkHealth();
      setStatus(healthData.status === 'healthy' ? 'healthy' : 'unhealthy');
      setLastCheck(new Date());

      // If API is healthy, get model info
      if (healthData.status === 'healthy') {
        try {
          const info = await apiService.getModelInfo();
          setModelInfo(info);
        } catch (error) {
          console.error('Error fetching model info:', error);
        }
      }
    } catch (error) {
      console.error('Error checking API health:', error);
      setStatus('unhealthy');
      setLastCheck(new Date());
    }
  };

  const formatLastCheck = () => {
    return lastCheck.toLocaleTimeString();
  };

  // Render the appropriate status badge
  const renderStatusBadge = () => {
    switch (status) {
      case 'healthy':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            API онлайн
          </Badge>
        );
      case 'unhealthy':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            API оффлайн
          </Badge>
        );
      case 'loading':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            Проверка...
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={className} onClick={checkApiHealth}>
            {renderStatusBadge()}
          </div>
        </TooltipTrigger>
        <TooltipContent className="p-4 max-w-sm bg-white">
          <div className="space-y-2">
            <p className="font-medium text-gray-900">
              Статус API: {status === 'healthy' ? 'В сети' : status === 'unhealthy' ? 'Не доступен' : 'Проверка...'}
            </p>
            <p className="text-sm text-gray-500">
              Последняя проверка: {formatLastCheck()}
            </p>
            {modelInfo && (
              <div className="text-xs space-y-1 mt-2 text-gray-600">
                <p>Модель: {modelInfo.name}</p>
                <p>Версия: {modelInfo.version}</p>
                {modelInfo.classes && (
                  <p>Классы: {modelInfo.classes.join(', ')}</p>
                )}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Нажмите для обновления статуса
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ApiStatus; 