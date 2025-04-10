
import React from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface CalendarRangeProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  onDateRangeChange: (dateRange: { from: Date; to: Date }) => void;
}

export const CalendarRange: React.FC<CalendarRangeProps> = ({ 
  dateRange, 
  onDateRangeChange 
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              format(dateRange.from, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateRange.from}
            onSelect={(date) => date && onDateRangeChange({ ...dateRange, from: date })}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div className="flex items-center mx-2">to</div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.to ? (
              format(dateRange.to, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={dateRange.to}
            onSelect={(date) => date && onDateRangeChange({ ...dateRange, to: date })}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
