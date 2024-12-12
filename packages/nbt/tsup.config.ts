import { defineConfig, type Options } from "tsup";
import DefaultConfig from "@serenityjs/internal-config/tsup";

export default defineConfig((options: Options) => ({
  ...DefaultConfig,
  ...options,
  minify: false
}));
