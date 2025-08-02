import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { Uuid } from "./uuid";

enum CommandOriginDataTypes {
  ORIGIN_PLAYER,
  ORIGIN_BLOCK,
  ORIGIN_MINECART_BLOCK,
  ORIGIN_DEV_CONSOLE,
  ORIGIN_TEST,
  ORIGIN_AUTOMATION_PLAYER,
  ORIGIN_CLIENT_AUTOMATION,
  ORIGIN_DEDICATED_SERVER,
  ORIGIN_ENTITY,
  ORIGIN_VIRTUAL,
  ORIGIN_GAME_ARGUMENT,
  ORIGIN_ENTITY_SERVER
}

class CommandOriginData extends DataType {
  public origin: CommandOriginDataTypes;
  public uuid: string;
  public requestId: string;
  public playerActorUniqueId: bigint;

  public constructor(
    origin: CommandOriginDataTypes,
    uuid: string,
    requestId: string,
    playerActorUniqueId: bigint
  ) {
    super();
    this.origin = origin;
    this.uuid = uuid;
    this.requestId = requestId;
    this.playerActorUniqueId = playerActorUniqueId ?? 0n;
  }

  public static read(stream: BinaryStream): CommandOriginData {
    const origin = stream.readVarInt();
    const uuid = Uuid.read(stream);
    const requestId = stream.readVarString();
    let playerActorUniqueId = 0n;

    if (
      origin === CommandOriginDataTypes.ORIGIN_DEV_CONSOLE ||
      origin === CommandOriginDataTypes.ORIGIN_TEST
    ) {
      playerActorUniqueId = stream.readVarLong();
    }

    return new CommandOriginData(origin, uuid, requestId, playerActorUniqueId);
  }

  public static write(stream: BinaryStream, value: CommandOriginData): void {
    stream.writeVarInt(value.origin);
    Uuid.write(stream, value.uuid);
    stream.writeVarString(value.requestId);

    if (
      value.origin === CommandOriginDataTypes.ORIGIN_DEV_CONSOLE ||
      value.origin === CommandOriginDataTypes.ORIGIN_TEST
    ) {
      stream.writeVarLong(value.playerActorUniqueId);
    }
  }
}

export { CommandOriginData };
