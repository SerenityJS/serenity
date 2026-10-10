import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { Uuid } from "./uuid";

class GatheringJoinInfo extends DataType {
  /**
   * The unique identifier for the experience.
   */
  public experienceId: string;

  /**
   * The name of the experience.
   */
  public experienceName: string;

  /**
   * The unique identifier for the experience world.
   */
  public experienceWorldId: string | null;

  /**
   * The name of the experience world.
   */
  public experienceWorldName: string | null;

  /**
   * The unique identifier for the creator of the experience.
   */
  public creatorId: string;

  /**
   * The unique identifier for the target.
   */
  public targetId: string | null;

  /**
   * The unique identifier for the scenario.
   */
  public scenarioId: string | null;

  /**
   * The unique identifier for the server.
   */
  public serverId: string | null;

  public constructor(
    experienceId: string,
    experienceName: string,
    experienceWorldId: string | null,
    experienceWorldName: string | null,
    creatorId: string,
    targetId: string | null = null,
    scenarioId: string | null = null,
    serverId: string | null = null
  ) {
    super();
    this.experienceId = experienceId;
    this.experienceName = experienceName;
    this.experienceWorldId = experienceWorldId;
    this.experienceWorldName = experienceWorldName;
    this.creatorId = creatorId;
    this.targetId = targetId;
    this.scenarioId = scenarioId;
    this.serverId = serverId;
  }

  public static read(stream: BinaryStream): GatheringJoinInfo {
    const experienceId = Uuid.read(stream);
    const experienceName = stream.readVarString();
    const experienceWorldId = stream.readBool() ? Uuid.read(stream) : null;
    const experienceWorldName = stream.readBool()
      ? stream.readVarString()
      : null;
    const creatorId = stream.readVarString();
    const targetId = stream.readBool() ? Uuid.read(stream) : null;
    const scenarioId = stream.readBool() ? stream.readVarString() : null;
    const serverId = stream.readBool() ? stream.readVarString() : null;

    return new this(
      experienceId,
      experienceName,
      experienceWorldId,
      experienceWorldName,
      creatorId,
      targetId,
      scenarioId,
      serverId
    );
  }

  public static write(stream: BinaryStream, value: GatheringJoinInfo): void {
    Uuid.write(stream, value.experienceId);
    stream.writeVarString(value.experienceName);

    stream.writeBool(value.experienceWorldId !== null);
    if (value.experienceWorldId !== null)
      Uuid.write(stream, value.experienceWorldId);

    stream.writeBool(value.experienceWorldName !== null);
    if (value.experienceWorldName !== null)
      stream.writeVarString(value.experienceWorldName);

    stream.writeVarString(value.creatorId);

    stream.writeBool(value.targetId !== null);
    if (value.targetId !== null) Uuid.write(stream, value.targetId);

    stream.writeBool(value.scenarioId !== null);
    if (value.scenarioId !== null) stream.writeVarString(value.scenarioId);

    stream.writeBool(value.serverId !== null);
    if (value.serverId !== null) stream.writeVarString(value.serverId);
  }
}

export { GatheringJoinInfo };
