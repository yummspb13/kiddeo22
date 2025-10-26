// Скрипт для очистки истекших сессий
import { cleanupExpiredSessions } from './auth-session';

// Запускаем очистку каждые 10 минут
setInterval(async () => {
  try {
    await cleanupExpiredSessions();
    console.log('🧹 Cleaned up expired sessions');
  } catch (error) {
    console.error('Failed to cleanup sessions:', error);
  }
}, 10 * 60 * 1000); // 10 минут

// Запускаем очистку при старте
cleanupExpiredSessions().catch(console.error);
