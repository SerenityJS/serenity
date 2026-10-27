import { BinaryStream, DataType } from "@serenityjs/binarystream";

/**
 * Represents the optional details of a matchmaking state change.
 */
class MatchmakingStateOptions extends DataType {
  /**
   * The name of the player that triggered the state change, if any.
   */
  public triggeringPlayerName: string | null;

  /**
   * Whether the state change was triggered by the local player, if known.
   */
  public triggeredByLocalPlayer: boolean | null;

  /**
   * Creates a new matchmaking state options instance.
   * @param triggeringPlayerName The name of the player that triggered the state change.
   * @param triggeredByLocalPlayer Whether the state change was triggered by the local player.
   */
  public constructor(
    triggeringPlayerName: string | null = null,
    triggeredByLocalPlayer: boolean | null = null
  ) {
    super();
    this.triggeringPlayerName = triggeringPlayerName;
    this.triggeredByLocalPlayer = triggeredByLocalPlayer;
  }

  public static read(stream: BinaryStream): MatchmakingStateOptions {
    // Read the optional name of the triggering player
    const triggeringPlayerName = stream.readBool()
      ? stream.readVarString()
      : null;

    // Read the optional local player trigger flag
    const triggeredByLocalPlayer = stream.readBool() ? stream.readBool() : null;

    // Return the new matchmaking state options
    return new this(triggeringPlayerName, triggeredByLocalPlayer);
  }

  public static write(
    stream: BinaryStream,
    value: MatchmakingStateOptions
  ): void {
    // Write the optional name of the triggering player
    stream.writeBool(value.triggeringPlayerName !== null);
    if (value.triggeringPlayerName !== null)
      stream.writeVarString(value.triggeringPlayerName);

    // Write the optional local player trigger flag
    stream.writeBool(value.triggeredByLocalPlayer !== null);
    if (value.triggeredByLocalPlayer !== null)
      stream.writeBool(value.triggeredByLocalPlayer);
  }
}

export { MatchmakingStateOptions };
