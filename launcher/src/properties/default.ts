const DEFAULT_SERVER_PROPERTIES = `# Server Properties

server-name: "SerenityJS Server"
# The name of the server seen in the server list.

server-address: "0.0.0.0"
# The address that the server will bind to.

server-port: 19132
# The port that the server will bind to.

max-players: 20
# The maximum amount of players that can join the server.

network-comression-threshold: 256
# The threshold for network compression.

network-compression-algorithm: "zlib"
# The algorithm used for network compression. (zlib, snappy)

network-packets-per-frame: 32
# The max amount of packets allowed to be sent per frame.
# A client exceeding this limit will be disconnected.

debug-logging: false
# Whether or not debug messages should be shown.
`;

export { DEFAULT_SERVER_PROPERTIES };
