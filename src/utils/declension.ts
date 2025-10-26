// Утилиты для правильного склонения

// Склонение слова "событие" в зависимости от числа
export const getEventDeclension = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  // Исключения для 11-14
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'событий';
  }
  
  if (lastDigit === 1) {
    return 'событие';
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return 'события';
  } else {
    return 'событий';
  }
};

// Склонение слова "место" в зависимости от числа
export const getVenueDeclension = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  // Исключения для 11-14
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'мест';
  }
  
  if (lastDigit === 1) {
    return 'место';
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return 'места';
  } else {
    return 'мест';
  }
};

// Склонение слова "отзыв" в зависимости от числа
export const getReviewDeclension = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  // Исключения для 11-14
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'отзывов';
  }
  
  if (lastDigit === 1) {
    return 'отзыв';
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return 'отзыва';
  } else {
    return 'отзывов';
  }
};

// Склонение слова "просмотр" в зависимости от числа
export const getViewDeclension = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  // Исключения для 11-14
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'просмотров';
  }
  
  if (lastDigit === 1) {
    return 'просмотр';
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return 'просмотра';
  } else {
    return 'просмотров';
  }
};

// Склонение слова "рейтинг" в зависимости от числа
export const getRatingDeclension = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  // Исключения для 11-14
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'рейтингов';
  }
  
  if (lastDigit === 1) {
    return 'рейтинг';
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return 'рейтинга';
  } else {
    return 'рейтингов';
  }
};
