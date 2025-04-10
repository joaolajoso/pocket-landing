
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';

interface DateRange {
  from: Date;
  to: Date;
}

interface CalendarRangeProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function CalendarRange({ dateRange, onDateRangeChange }: CalendarRangeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span>
            {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          defaultMonth={dateRange.from}
          selected={{
            from: dateRange.from,
            to: dateRange.to,
          }}
          onSelect={(range) => {
            if (range?.from && range.to) {
              onDateRangeChange({
                from: range.from,
                to: range.to
              });
              setIsOpen(false);
            }
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
