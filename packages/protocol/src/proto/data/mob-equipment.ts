import { Int8, Uint8, VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { type ContainerId, Packet } from "../../enums";
import { NetworkItemStackDescriptorCereal } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.MobEquipment)
class MobEquipmentPacket extends DataPacket {
  @Serialize(VarLong) public runtimeEntityId!: bigint;
  @Serialize(NetworkItemStackDescriptorCereal)
  public item!: NetworkItemStackDescriptorCereal;

  @Serialize(Uint8) public slot!: number;
  @Serialize(Uint8) public selectedSlot!: number;
  @Serialize(Int8) public containerId!: ContainerId;
}

export { MobEquipmentPacket };
