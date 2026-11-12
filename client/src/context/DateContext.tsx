import React, { createContext, useContext, useState, useMemo } from 'react';
import { format, addDays, subDays, isToday as checkIsToday, isYesterday, isTomorrow, parseISO } from 'date-fns';

interface DateContextType {
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  prevDay: () => void;
  nextDay: () => void;
  setToday: () => void;
  isToday: boolean;
  formattedDateLabel: string;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const getInitialDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const DateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate);

  const prevDay = () => {
    const current = parseISO(selectedDate);
    const prev = subDays(current, 1);
    setSelectedDate(format(prev, 'yyyy-MM-dd'));
  };

  const nextDay = () => {
    const current = parseISO(selectedDate);
    const next = addDays(current, 1);
    setSelectedDate(format(next, 'yyyy-MM-dd'));
  };

  const setToday = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const isToday = useMemo(() => {
    try {
      return checkIsToday(parseISO(selectedDate));
    } catch {
      return false;
    }
  }, [selectedDate]);

  const formattedDateLabel = useMemo(() => {
    try {
      const parsed = parseISO(selectedDate);
      if (checkIsToday(parsed)) {
        return `Today, ${format(parsed, 'MMM d')}`;
      }
      if (isYesterday(parsed)) {
        return `Yesterday, ${format(parsed, 'MMM d')}`;
      }
      if (isTomorrow(parsed)) {
        return `Tomorrow, ${format(parsed, 'MMM d')}`;
      }
      return format(parsed, 'EEE, MMM d, yyyy');
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <DateContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        prevDay,
        nextDay,
        setToday,
        isToday,
        formattedDateLabel
      }}
    >
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => {
  const context = useContext(DateContext);
  if (!context) throw new Error('useDate must be used within a DateProvider');
  return context;
};
