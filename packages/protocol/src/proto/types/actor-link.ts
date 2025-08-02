import { BinaryStream, DataType } from "@serenityjs/binarystream";

import type { ActorLinkType } from "../../enums";

class ActorLink extends DataType {
  public riddenUniqueId: bigint;
  public riderUniqueId: bigint;
  public type: ActorLinkType;
  public immediate: boolean;
  public riderInitiated: boolean;
  public vehicleAngularVelocity: number;

  public constructor(
    riddenUniqueId: bigint,
    riderUniqueId: bigint,
    type: ActorLinkType,
    immediate: boolean,
    riderInitiated: boolean,
    vehicleAngularVelocity: number
  ) {
    super();
    this.riddenUniqueId = riddenUniqueId;
    this.riderUniqueId = riderUniqueId;
    this.type = type;
    this.immediate = immediate;
    this.riderInitiated = riderInitiated;
    this.vehicleAngularVelocity = vehicleAngularVelocity;
  }

  public static write(stream: BinaryStream, value: ActorLink): void {
    stream.writeZigZong(value.riddenUniqueId);
    stream.writeZigZong(value.riderUniqueId);
    stream.writeUint8(value.type);
    stream.writeBool(value.immediate);
    stream.writeBool(value.riderInitiated);
    stream.writeFloat32(value.vehicleAngularVelocity);
  }

  public static read(stream: BinaryStream): ActorLink {
    return new ActorLink(
      stream.readZigZong(),
      stream.readZigZong(),
      stream.readUint8(),
      stream.readBool(),
      stream.readBool(),
      stream.readFloat32()
    );
  }
}

export { ActorLink };
