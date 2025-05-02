import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MentionBadgeProps {
  text: string;
  onRemove?: () => void;
  className?: string;
}

export function MentionBadge({ text, onRemove, className }: MentionBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center bg-diabetly-blue/10 text-diabetly-blue text-xs px-2 py-1 rounded-full gap-1",
      className
    )}>
      <span>@{text}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-diabetly-blue hover:text-diabetly-darkblue rounded-full hover:bg-diabetly-blue/20 p-0.5 transition-colors"
          aria-label="Удалить упоминание"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
} 