/**
 * @type {import("tsup").Options}
 */
export default {
  entryPoints: ["src/index.ts"],
  clean: true,
  dts: true,
  format: ["cjs"],
  minify: true,
}
