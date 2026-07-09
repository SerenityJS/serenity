import { VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { NetworkItemStackDescriptorCereal } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.MobArmorEquipment)
class MobArmorEquipmentPacket extends DataPacket {
  @Serialize(VarLong) public runtimeId!: bigint;
  @Serialize(NetworkItemStackDescriptorCereal)
  public helmet!: NetworkItemStackDescriptorCereal;
  @Serialize(NetworkItemStackDescriptorCereal)
  public chestplate!: NetworkItemStackDescriptorCereal;
  @Serialize(NetworkItemStackDescriptorCereal)
  public leggings!: NetworkItemStackDescriptorCereal;
  @Serialize(NetworkItemStackDescriptorCereal)
  public boots!: NetworkItemStackDescriptorCereal;
  @Serialize(NetworkItemStackDescriptorCereal)
  public body!: NetworkItemStackDescriptorCereal;
}

export { MobArmorEquipmentPacket };
