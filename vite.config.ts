import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/gold-loan-calculator/',
  plugins: [react()],
});