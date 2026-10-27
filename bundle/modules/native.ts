import { setNativeBinding } from "@serenityjs/nethernet";

/**
 * Requires the libdatachannel binding of the current platform.
 * node-datachannel requires it by a computed package name, which `bun build --compile` cannot embed,
 * so it is required here by its literal name and handed to NetherNet.
 */
function load(): unknown {
  const { platform, arch } = process;

  // Linux builds differ between glibc and musl
  const report = process.report?.getReport() as {
    header?: { glibcVersionRuntime?: string };
  };
  const musl = platform === "linux" && !report?.header?.glibcVersionRuntime;

  try {
    if (platform === "win32" && arch === "x64")
      return require("@node-datachannel/win32-x64-msvc");
    if (platform === "win32" && arch === "arm64")
      return require("@node-datachannel/win32-arm64-msvc");
    if (platform === "darwin" && arch === "x64")
      return require("@node-datachannel/darwin-x64");
    if (platform === "darwin" && arch === "arm64")
      return require("@node-datachannel/darwin-arm64");
    if (platform === "linux" && arch === "x64")
      return musl
        ? require("@node-datachannel/linux-x64-musl")
        : require("@node-datachannel/linux-x64-gnu");
    if (platform === "linux" && arch === "arm64")
      return musl
        ? require("@node-datachannel/linux-arm64-musl")
        : require("@node-datachannel/linux-arm64-gnu");
  } catch {
    // Let node-datachannel try to load its binding itself
  }

  return null;
}

const binding = load();
if (binding) setNativeBinding(binding as Parameters<typeof setNativeBinding>[0]);
