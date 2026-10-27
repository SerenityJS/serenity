import {
  Endianness,
  Float32,
  VarLong,
  VarString,
  ZigZong
} from "@serenityjs/binarystream";

import { Serialize, Proto } from "../../decorators";
import { Packet } from "../../enums";
import {
  DataItem,
  Vector3f,
  EntityAttributes,
  ActorLinkSet,
  PropertySyncData,
  ActorLink,
  PassengerOfBlockArguments
} from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.AddEntity)
class AddEntityPacket extends DataPacket {
  @Serialize(ZigZong) public uniqueEntityId!: bigint;
  @Serialize(VarLong) public runtimeId!: bigint;
  @Serialize(VarString) public identifier!: string;
  @Serialize(Vector3f) public position!: Vector3f;
  @Serialize(Vector3f) public velocity!: Vector3f;
  @Serialize(Float32, { endian: Endianness.Little }) public pitch!: number;
  @Serialize(Float32, { endian: Endianness.Little }) public yaw!: number;
  @Serialize(Float32, { endian: Endianness.Little }) public headYaw!: number;
  @Serialize(Float32, { endian: Endianness.Little }) public bodyYaw!: number;
  @Serialize(EntityAttributes) public attributes!: Array<EntityAttributes>;
  @Serialize(DataItem) public data!: Array<DataItem>;
  @Serialize(PropertySyncData) public properties!: PropertySyncData;
  @Serialize(ActorLinkSet) public links!: Array<ActorLink>;

  /**
   * The initial passenger of block state of the entity, if it is riding a block.
   */
  @Serialize(PassengerOfBlockArguments, { optional: true })
  public passengerBlockData?: PassengerOfBlockArguments;
}

export { AddEntityPacket };
