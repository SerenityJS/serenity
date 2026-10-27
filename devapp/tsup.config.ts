import { defineConfig, type Options } from "tsup";
import DefaultConfig from "@serenityjs/internal-config/tsup";

export default defineConfig((options: Options) => ({
  ...DefaultConfig,
  // The dev app is not imported by anything, so it needs no type declarations.
  // Building them also finishes after `yarn dev` starts the server, printing over its console.
  dts: false,
  ...options
}));
