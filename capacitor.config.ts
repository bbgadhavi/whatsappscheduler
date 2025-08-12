import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.whatsappscheduler.app',
  appName: 'Android Message Scheduler',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
