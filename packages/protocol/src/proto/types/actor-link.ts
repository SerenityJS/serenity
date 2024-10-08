import { DataType } from "@serenityjs/raknet";

import type { ActorLinkType } from "../../enums";
import type { BinaryStream } from "@serenityjs/binarystream";

class ActorLink extends DataType {
  public riddenEntityUnique: bigint;
  public riderEntityUnique: bigint;
  public type: ActorLinkType;
  public immediate: boolean;
  public riderInitiated: boolean;
  public vehicleAngularVelocity: number;

  public constructor(
    riddenEntityUnique: bigint,
    riderEntityUnique: bigint,
    type: ActorLinkType,
    immediate: boolean,
    riderInitiated: boolean,
    vehicleAngularVelocity: number
  ) {
    super();
    this.riddenEntityUnique = riddenEntityUnique;
    this.riderEntityUnique = riderEntityUnique;
    this.type = type;
    this.immediate = immediate;
    this.riderInitiated = riderInitiated;
    this.vehicleAngularVelocity = vehicleAngularVelocity;
  }

  public static write(stream: BinaryStream, value: ActorLink): void {
    stream.writeVarLong(value.riddenEntityUnique);
    stream.writeVarLong(value.riderEntityUnique);
    stream.writeByte(value.type);
    stream.writeBool(value.immediate);
    stream.writeBool(value.riderInitiated);
    stream.writeFloat32(value.vehicleAngularVelocity);
  }

  public static read(stream: BinaryStream): ActorLink {
    return new ActorLink(
      stream.readVarLong(),
      stream.readVarLong(),
      stream.readByte(),
      stream.readBool(),
      stream.readBool(),
      stream.readFloat32()
    );
  }
}

export { ActorLink };
