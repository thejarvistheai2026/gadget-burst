import { defineConfig } from "vite";
import { gadget } from "gadget-server/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [gadget(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./web"),
    },
  },
  optimizeDeps: {
    exclude: ["AutoRichTextInput-V5WIQX6O"],
  },
});