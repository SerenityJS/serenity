const DEFAULT_SERVER_PROPERTIES = /* yaml */ `# Server Properties

server-name: "SerenityJS Server"
# The name of the server seen in the server list.

server-address: "0.0.0.0"
# The address that the server will bind to.

server-port: 19132
# The port that the server will bind to.

server-tps: 20
# The amount of ticks per second the server will run at.

server-shutdown-message: "Server Closed."
# The message to show when the server is shutting down.

server-mtu-max: 1012
# The maximum transmission unit of the server.
# Lowering this value can help with packet loss.

server-mtu-min: 400
# The minimum transmission unit of the server.

max-players: 20
# The maximum amount of players that can join the server.

network-comression-threshold: 256
# The threshold for network compression.

network-compression-algorithm: "zlib"
# The algorithm used for network compression. (zlib, snappy)

network-packets-per-frame: 64
# The max amount of packets allowed to be sent per frame.
# A client exceeding this limit will be disconnected.

plugins-enabled: true
# Whether or not plugins should be enabled.
# Plugins add additional functionality to the server.

plugins-path: "plugins"
# The path to the plugins folder.

worlds-default: "default"
# The default world to load when the server starts.

worlds-default-provider: "leveldb"
# The default provider to use when creating new worlds.

worlds-default-generator: "overworld"
# The default generator to use when creating new worlds.

worlds-path: "worlds"
# The path to the worlds folder.

debug-logging: false
# Whether or not debug messages should be shown.

must-accept-packs: false
# Whether or not the client must accept resource packs.

resource-packs:
#   - uuid: "00000000-0000-0000-0000-000000000000"
#   - uuid: "00000000-0000-0000-0000-000000000001"
#     subpack: "example"
# Example list of resource packs to enable.
`;

export { DEFAULT_SERVER_PROPERTIES };
