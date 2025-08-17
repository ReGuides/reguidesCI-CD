// Утилиты для работы с датами в формате "17 августа"

const monthNames = {
  'января': 0,
  'февраля': 1,
  'марта': 2,
  'апреля': 3,
  'мая': 4,
  'июня': 5,
  'июля': 6,
  'августа': 7,
  'сентября': 8,
  'октября': 9,
  'ноября': 10,
  'декабря': 11
};

/**
 * Парсит дату в формате "17 августа" и возвращает объект Date
 */
export function parseBirthday(birthdayString: string): Date | null {
  if (!birthdayString) return null;
  
  const match = birthdayString.match(/^(\d{1,2})\s+([а-яё]+)$/i);
  if (!match) return null;
  
  const day = parseInt(match[1], 10);
  const monthName = match[2].toLowerCase();
  
  if (!monthNames[monthName as keyof typeof monthNames]) {
    return null;
  }
  
  const month = monthNames[monthName as keyof typeof monthNames];
  
  // Создаем дату в текущем году
  const currentYear = new Date().getFullYear();
  const date = new Date(currentYear, month, day);
  
  // Проверяем валидность даты
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date;
}

/**
 * Проверяет, совпадает ли дата дня рождения с текущей датой
 */
export function isBirthdayToday(birthdayString: string): boolean {
  const birthday = parseBirthday(birthdayString);
  if (!birthday) return false;
  
  const today = new Date();
  
  return birthday.getDate() === today.getDate() && 
         birthday.getMonth() === today.getMonth();
}

/**
 * Получает текущую дату в формате "17 августа"
 */
export function getCurrentDateString(): string {
  const today = new Date();
  const day = today.getDate();
  const monthIndex = today.getMonth();
  
  const monthNamesArray = Object.keys(monthNames);
  const monthName = monthNamesArray[monthIndex];
  
  return `${day} ${monthName}`;
}

/**
 * Сравнивает две даты в формате "17 августа"
 */
export function compareBirthdayDates(date1: string, date2: string): number {
  const parsed1 = parseBirthday(date1);
  const parsed2 = parseBirthday(date2);
  
  if (!parsed1 && !parsed2) return 0;
  if (!parsed1) return -1;
  if (!parsed2) return 1;
  
  return parsed1.getTime() - parsed2.getTime();
}
