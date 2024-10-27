/**
 * @type {import("tsup").Options}
 */
export default {
  bundle: true,
  cjsInterop: true,
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  external: [/^@serenityjs/],
  format: ["cjs", "esm"],
  keepNames: true,
  minify: true,
  skipNodeModulesBundle: true,
  sourcemap: "inline",
  splitting: false,
  treeshake: false,
  tsconfig: "./tsconfig.json",
};
