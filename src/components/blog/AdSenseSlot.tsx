import React from 'react';
import { DynamicAdBanner } from '../ads/DynamicAdBanner';

interface AdSenseSlotProps {
  slotId?: string;
  clientId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  className?: string;
  label?: string;
}

export const AdSenseSlot: React.FC<AdSenseSlotProps> = ({
  format = 'auto',
  className = '',
}) => {
  const isHorizontal = format === 'horizontal';

  return (
    <div className={`w-full my-6 ${className}`}>
      <DynamicAdBanner format={isHorizontal ? 'horizontal' : 'sidebar'} />
    </div>
  );
};
