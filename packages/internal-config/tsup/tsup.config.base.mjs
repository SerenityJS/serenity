/**
 * @type {import("tsup").Options}
 */
export default {
  entry: ["src/index.ts"],
  external: [/^@serenityjs/],
  clean: true,
  format: ["cjs", "esm"],
  minify: false,
  dts: true,
  skipNodeModulesBundle: true,
  splitting: false,
  treeshake: true,
  cjsInterop: true,
};
