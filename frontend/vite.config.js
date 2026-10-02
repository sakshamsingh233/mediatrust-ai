import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The frontend talks to the backend at http://localhost:5000.
// VITE_API_URL is optional; it only ever holds a base URL, never credentials.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
