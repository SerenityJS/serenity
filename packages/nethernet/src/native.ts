import type NodeDataChannel from "node-datachannel";

/**
 * The parts of the libdatachannel binding NetherNet uses.
 */
type NativeBinding = Pick<
  typeof NodeDataChannel,
  "PeerConnection" | "IceUdpMuxListener" | "initLogger" | "cleanup"
>;

/**
 * The libdatachannel binding, once loaded or provided.
 */
let binding: NativeBinding | null = null;

/**
 * Provides the libdatachannel binding instead of letting node-datachannel load it.
 * node-datachannel requires its binding by a computed package name, which bundlers such as
 * `bun build --compile` cannot follow; bundles can require the binding by its literal name and pass it here.
 * @param native The binding, such as `require("@node-datachannel/win32-x64-msvc")`.
 */
function setNativeBinding(native: NativeBinding): void {
  binding = native;
}

/**
 * Gets the libdatachannel binding, loading node-datachannel if none was provided.
 * @returns The binding.
 */
function loadNativeBinding(): Promise<NativeBinding> {
  if (binding) return Promise.resolve(binding);

  // Load node-datachannel lazily, so a provided binding is used without ever running its loader
  return import("node-datachannel").then(
    (module) => (binding = (module.default ?? module) as NativeBinding)
  );
}

export { NativeBinding, setNativeBinding, loadNativeBinding };
