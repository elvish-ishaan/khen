import app from './app';
import { env } from './config/env';
import { initializeFirebaseAdmin } from './services/firebase.service';

const PORT = parseInt(env.PORT, 10);

// Initialize Firebase Admin SDK
try {
  initializeFirebaseAdmin();
} catch (error) {
  console.error('⚠️ Failed to initialize Firebase Admin:', error);
  console.log('📱 Push notifications will not work');
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});
