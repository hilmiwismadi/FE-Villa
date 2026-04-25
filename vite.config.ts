import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const orderTarget = env.VITE_ORDER_SERVICE_URL || 'https://yutaka-order.izcy.tech';
  const promoTarget = env.VITE_PROMO_SERVICE_URL || 'https://yutaka-promo.izcy.tech';
  const authTarget = env.VITE_AUTH_SERVICE_URL || 'https://yutaka-auth.izcy.tech';
  const bffTarget = env.VITE_BFF_URL || 'http://localhost:3100';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/order': {
          target: orderTarget,
          changeOrigin: true,
          secure: false,
        },
        '/promo': {
          target: promoTarget,
          changeOrigin: true,
          secure: false,
        },
        '/api/v1/auth': {
          target: authTarget,
          changeOrigin: true,
          secure: false,
        },
        '/bff': {
          target: bffTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
