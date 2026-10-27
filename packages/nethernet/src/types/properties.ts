interface NetherNetServerProperties {
  /**
   * The address the signaling server and the WebRTC transport are bound to.
   */
  address: string;

  /**
   * The port of the server, used over TCP for signaling and over UDP for game data.
   */
  port: number;

  /**
   * The protocol version reported to clients before they join.
   */
  protocol: number;

  /**
   * The game version reported to clients before they join.
   */
  version: string;

  /**
   * The server name reported to clients before they join.
   */
  message: string;

  /**
   * The level name reported to clients before they join.
   */
  levelName: string;

  /**
   * The default game mode reported to clients before they join (0 survival, 1 creative, 2 adventure).
   */
  gameType: number;

  /**
   * The maximum amount of connections, including the ones still negotiating.
   */
  maxConnections: number;

  /**
   * The path of the PEM file holding the operator key that signs every SDP answer.
   * Clients that signal over plain HTTP pin this key the first time they join, so it is kept across restarts.
   * When null, a new key is generated on every start, and players are asked to trust the server again.
   */
  identityPath: string | null;

  /**
   * The domain clients may show next to the operator key when asking players to trust the server.
   */
  identityDomain: string;

  /**
   * The path of a PEM certificate to serve signaling over HTTPS with.
   * Clients that reach the server over HTTPS trust its certificate, so players are not asked to trust the operator key.
   */
  tlsCertificatePath: string | null;

  /**
   * The path of the PEM private key of the HTTPS certificate.
   */
  tlsKeyPath: string | null;

  /**
   * The address clients reach the server at, added to every SDP answer as a candidate.
   * When null, the address the client used to reach the signaling server is added instead,
   * which lets clients join a server behind NAT without any configuration.
   */
  publicAddress: string | null;

  /**
   * The UDP port clients reach the server at, when it differs from the port they signal to.
   */
  publicPort: number | null;

  /**
   * Whether to reject SDP offers that do not carry a valid identity assertion.
   */
  requireIdentity: boolean;

  /**
   * The time in milliseconds a client has to open its data channels after receiving the SDP answer.
   */
  negotiationTimeout: number;

  /**
   * The time in milliseconds without any message after which a connection is closed, or 0 to disable it.
   */
  inactivityTimeout: number;
}

export { NetherNetServerProperties };
