import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://dine360-env.eba-jnhgvsu9.ap-south-1.elasticbeanstalk.com",
        changeOrigin: true,
      },
    },
  },
});
