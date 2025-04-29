import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const ImageUploader = ({ onImageUpload }: { onImageUpload: (file: File) => void }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, загрузите файл изображения (JPEG, PNG, и т.д.)",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Файл слишком большой. Максимальный размер - 5MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    onImageUpload(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-sm border-diabetly-skyblue/30">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2 text-diabetly-darkblue">Загрузка снимка сетчатки глаза</h3>
        <p className="text-gray-600">Поддерживаются форматы: JPEG, PNG, и GIF до 5MB</p>
      </div>

      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-diabetly-blue bg-diabetly-blue/10' 
              : 'border-gray-300 hover:border-diabetly-blue hover:bg-diabetly-skyblue/10'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <input 
            ref={inputRef}
            type="file" 
            accept="image/*" 
            onChange={handleChange} 
            className="hidden" 
          />
          <Upload className="h-12 w-12 mx-auto mb-4 text-diabetly-blue/70" />
          <p className="text-lg font-medium mb-1 text-diabetly-darkblue">Перетащите файл сюда или нажмите для выбора</p>
          <p className="text-sm text-gray-500">Загрузите чёткий снимок сетчатки глаза для лучшего анализа</p>
        </div>
      ) : (
        <div className="relative">
          <img 
            src={preview} 
            alt="Предпросмотр" 
            className="w-full h-auto max-h-[400px] object-contain rounded-lg border border-diabetly-skyblue/30 shadow-md" 
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
          <p className="mt-2 text-sm text-center text-gray-500">
            Загружено: {selectedFile?.name} ({Math.round(selectedFile?.size! / 1024)} KB)
          </p>
        </div>
      )}
    </Card>
  );
};

export default ImageUploader;
