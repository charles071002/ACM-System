import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ph.edu.rtu.acmsystem',
  appName: 'ACM System',
  webDir: 'dist',
  server: {
    url: 'https://acm-system-app.vercel.app/',
    cleartext: false
  }
};

export default config;
