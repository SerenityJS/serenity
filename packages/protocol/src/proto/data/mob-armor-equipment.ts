import { VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";
import { Packet } from "../../enums";
import { NetworkItemStackDescriptor } from "../types";
import { DataPacket } from "./data-packet";

@Proto(Packet.MobArmorEquipment)
class MobArmorEquipmentPacket extends DataPacket {
    @Serialize(VarLong) public runtimeId!: bigint;
    @Serialize(NetworkItemStackDescriptor) public helmet!: NetworkItemStackDescriptor;
    @Serialize(NetworkItemStackDescriptor) public chestplate!: NetworkItemStackDescriptor;
    @Serialize(NetworkItemStackDescriptor) public leggings!: NetworkItemStackDescriptor;
    @Serialize(NetworkItemStackDescriptor) public boots!: NetworkItemStackDescriptor;
    @Serialize(NetworkItemStackDescriptor) public body!: NetworkItemStackDescriptor;
}

export { MobArmorEquipmentPacket };
