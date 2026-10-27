/**
 * The remote address of a connection.
 */
interface NetworkAddress {
  /**
   * The IP address of the remote peer.
   */
  address: string;

  /**
   * The port of the remote peer.
   */
  port: number;

  /**
   * The address family, either `IPv4` or `IPv6`.
   */
  family: string;
}

export { NetworkAddress };
