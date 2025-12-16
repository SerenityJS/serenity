import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { CommandOriginType } from "../../enums";

import { Uuid } from "./uuid";

class CommandOriginData extends DataType {
  /**
   * The type of the command origin.
   */
  public type: CommandOriginType;

  /**
   * The uuid of the command origin.
   */
  public uuid: string;

  /**
   * The request ID of the command origin.
   */
  public requestId: string;

  /**
   * The unique ID of the player actor.
   */
  public playerActorUniqueId: bigint;

  /**
   * Creates a new command origin data.
   * @param type The type of the command origin.
   * @param uuid The uuid of the command origin.
   * @param requestId The request ID of the command origin.
   * @param playerActorUniqueId The unique ID of the player actor.
   */
  public constructor(
    type: CommandOriginType,
    uuid: string,
    requestId: string,
    playerActorUniqueId: bigint
  ) {
    super();
    this.type = type;
    this.uuid = uuid;
    this.requestId = requestId;
    this.playerActorUniqueId = playerActorUniqueId ?? 0n;
  }

  public static read(stream: BinaryStream): CommandOriginData {
    const type = stream.readVarString() as CommandOriginType;
    const uuid = Uuid.read(stream);
    const requestId = stream.readVarString();
    let playerActorUniqueId = 0n;

    // Check if the origin type is DevConsole or Test
    if (
      type === CommandOriginType.DevConsole ||
      type === CommandOriginType.Test
    ) {
      playerActorUniqueId = stream.readVarLong();
    }

    // Return a new command origin data.
    return new this(type, uuid, requestId, playerActorUniqueId);
  }

  public static write(stream: BinaryStream, value: CommandOriginData): void {
    stream.writeVarString(value.type);
    Uuid.write(stream, value.uuid);
    stream.writeVarString(value.requestId);

    // Check if the origin type is DevConsole or Test
    if (
      value.type === CommandOriginType.DevConsole ||
      value.type === CommandOriginType.Test
    ) {
      stream.writeVarLong(value.playerActorUniqueId);
    }
  }
}

export { CommandOriginData };
