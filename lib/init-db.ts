import { initDefaultAdmin, initDB } from './db';

// Initialize database on server start
if (typeof window === 'undefined') {
  initDB().then(() => {
    initDefaultAdmin();
  }).catch(console.error);
}

