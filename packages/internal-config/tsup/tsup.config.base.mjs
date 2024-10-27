/**
 * @type {import("tsup").Options}
 */
export default {
  bundle: false,
  cjsInterop: true,
  clean: true,
  dts: true,
  entry: ["src/index.ts", "src/**/*"],
  external: [/^@serenityjs/],
  format: ["cjs", "esm"],
  keepNames: true,
  minify: false,
  skipNodeModulesBundle: true,
  sourcemap: 'inline',
  splitting: false,
  treeshake: true,
  tsconfig: "./tsconfig.json"
};
