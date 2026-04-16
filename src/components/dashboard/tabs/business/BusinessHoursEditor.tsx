import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { BusinessHour } from '@/types/organizationWebsite';

interface BusinessHoursEditorProps {
  hours: BusinessHour[];
  onChange: (hours: BusinessHour[]) => void;
}

const DEFAULT_DAYS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

export const BusinessHoursEditor = ({ hours, onChange }: BusinessHoursEditorProps) => {
  // Initialize with defaults if empty
  const currentHours = hours.length > 0 
    ? hours 
    : DEFAULT_DAYS.map(day => ({ day, hours: '09:00 - 18:00', isClosed: day === 'Domingo' }));

  const updateHour = (index: number, field: keyof BusinessHour, value: string | boolean) => {
    const updated = [...currentHours];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {currentHours.map((item, index) => (
        <div key={item.day} className="flex items-center gap-3">
          <div className="w-28 text-sm font-medium">
            {item.day.slice(0, 3)}
          </div>
          
          <Switch
            checked={!item.isClosed}
            onCheckedChange={(checked) => updateHour(index, 'isClosed', !checked)}
          />
          
          {item.isClosed ? (
            <span className="text-sm text-muted-foreground">Fechado</span>
          ) : (
            <Input
              value={item.hours}
              onChange={(e) => updateHour(index, 'hours', e.target.value)}
              placeholder="09:00 - 18:00"
              className="flex-1 max-w-[200px]"
            />
          )}
        </div>
      ))}

      <p className="text-xs text-muted-foreground mt-2">
        Formato: 09:00 - 18:00 ou 09:00 - 12:30, 14:00 - 18:00
      </p>
    </div>
  );
};
