/**
 * The status of a NetherNet connection.
 */
enum Status {
  /**
   * The SDP answer was sent, and the client has not opened its reliable data channel yet.
   */
  Connecting,

  /**
   * The reliable data channel is open, and game data can be exchanged.
   */
  Connected,

  /**
   * The connection was closed.
   */
  Disconnected
}

export { Status };
