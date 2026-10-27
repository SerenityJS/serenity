/**
 * The server information returned by the `GET /v1/join` endpoint, shown by clients before they join.
 */
interface NetherNetStatus {
  /**
   * The name of the server.
   */
  name: string;

  /**
   * The protocol version of the server.
   */
  protocol: number;

  /**
   * The game version of the server.
   */
  version: string;

  /**
   * The name of the loaded level.
   */
  level: string;

  /**
   * The current amount of players.
   */
  players: number;

  /**
   * The maximum amount of players.
   */
  maxPlayers: number;

  /**
   * The default game mode (0 survival, 1 creative, 2 adventure).
   */
  gameType: number;
}

export { NetherNetStatus };
