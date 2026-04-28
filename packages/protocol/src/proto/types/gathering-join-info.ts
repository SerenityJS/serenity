import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { Uuid } from "./uuid";

class GatheringJoinInfo extends DataType {
  public experienceId: string;

  public experienceName: string;

  public experienceWorldId: string;

  public experienceWorldName: string;

  public creatorId: string;

  public unk: string;

  public unk2: string;

  public serverId: string;

  public constructor(
    experienceId: string,
    experienceName: string,
    experienceWorldId: string,
    experienceWorldName: string,
    creatorId: string,
    unk: string,
    unk2: string,
    serverId: string
  ) {
    super();
    this.experienceId = experienceId;
    this.experienceName = experienceName;
    this.experienceWorldId = experienceWorldId;
    this.experienceWorldName = experienceWorldName;
    this.creatorId = creatorId;
    this.unk = unk;
    this.unk2 = unk2;
    this.serverId = serverId;
  }

  public static read(stream: BinaryStream): GatheringJoinInfo {
    const experienceId = Uuid.read(stream);
    const experienceName = stream.readVarString();
    const experienceWorldId = Uuid.read(stream);
    const experienceWorldName = stream.readVarString();
    const creatorId = stream.readVarString();
    const unk = Uuid.read(stream);
    const unk2 = Uuid.read(stream);
    const serverId = stream.readVarString();

    return new this(
      experienceId,
      experienceName,
      experienceWorldId,
      experienceWorldName,
      creatorId,
      unk,
      unk2,
      serverId
    );
  }

  public static write(stream: BinaryStream, value: GatheringJoinInfo): void {
    Uuid.write(stream, value.experienceId);
    stream.writeVarString(value.experienceName);
    Uuid.write(stream, value.experienceWorldId);
    stream.writeVarString(value.experienceWorldName);
    stream.writeVarString(value.creatorId);
    Uuid.write(stream, value.unk);
    Uuid.write(stream, value.unk2);
    stream.writeVarString(value.serverId);
  }
}

export { GatheringJoinInfo };
