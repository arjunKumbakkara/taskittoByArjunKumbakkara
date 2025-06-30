export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatDeadlineDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const extractLinks = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

export const validateImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

export const getQuadrantDeadline = (quadrant: string): Date => {
  const now = new Date();
  
  switch (quadrant) {
    case 'immediate':
      // 25 minutes from now
      return new Date(now.getTime() + 25 * 60 * 1000);
    
    case 'today':
      // End of today (11:59 PM)
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return endOfDay;
    
    case 'week':
      // Next Sunday at 8:00 PM
      const nextSunday = new Date(now);
      const daysUntilSunday = (7 - now.getDay()) % 7;
      nextSunday.setDate(now.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
      nextSunday.setHours(20, 0, 0, 0);
      return nextSunday;
    
    case 'month':
      // Last day of current month at 11:59 PM
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);
      return lastDayOfMonth;
    
    default:
      return now;
  }
};