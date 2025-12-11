import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  className?: string;
  showIcon?: boolean;
}

export function ErrorAlert({
  message,
  className,
  showIcon = false,
}: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        'text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200',
        className
      )}
    >
      {showIcon && (
        <AlertCircle className="h-4 w-4 inline-block mr-2" />
      )}
      {message}
    </div>
  );
}
