import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => ({
  ssr: {
    noExternal: command === "build" ? true : undefined,
  },
  plugins: [!process.env.VITEST && reactRouter(), tsconfigPaths()].filter(Boolean),
}));
