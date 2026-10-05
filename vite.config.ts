import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";

const deploymentEnv = process.env.BOBAKS_DEPLOYMENT_ENV ?? "production";
const uiDemoMode = process.env.BOBAKS_UI_DEMO_MODE === "true" ? "true" : "false";

export default defineConfig({
  define: {
    "process.env.BOBAKS_DEPLOYMENT_ENV": JSON.stringify(deploymentEnv),
    "process.env.BOBAKS_UI_DEMO_MODE": JSON.stringify(uiDemoMode),
  },
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
