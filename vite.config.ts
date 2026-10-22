import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isPortalBuild = mode === "portal";

  return {
    base: isPortalBuild ? "/portail-client/" : "/",
    build: {
      outDir: isPortalBuild ? "dist/portail-client" : "dist",
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: { host: "127.0.0.1" },
    preview: { host: "127.0.0.1" },
  };
});
