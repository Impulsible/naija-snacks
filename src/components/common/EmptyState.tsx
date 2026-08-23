import React from 'react';
import { SearchX } from 'lucide-react';
import Button from '../ui/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No results found',
  description = 'Try adjusting your search or filter criteria.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-6 bg-cream rounded-full flex items-center justify-center">
        <SearchX size={40} className="text-muted" />
      </div>
      <h3 className="font-heading font-semibold text-2xl mb-3">
        {title}
      </h3>
      <p className="text-muted text-lg mb-8 max-w-md mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;