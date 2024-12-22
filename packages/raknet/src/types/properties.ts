interface RaknetServerProperties {
  /**
   * The address of the server.
   */
  address: string;

  /**
   * The port of the server.
   */
  port: number;

  /**
   * The protocol version of the server.
   */
  protocol: number;

  /**
   * The version of the server.
   */
  version: string;

  /**
   * The message of the day of the server.
   */
  message: string;

  /**
   * The max connections of the server.
   */
  maxConnections: number;

  /**
   * The connections of the server.
   */
  mtuMaxSize: number;

  /**
   * The max mtu size of the server.
   */
  mtuMinSize: number;
}

export { RaknetServerProperties };
