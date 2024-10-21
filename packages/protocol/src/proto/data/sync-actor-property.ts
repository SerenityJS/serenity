import { CompoundTag } from "@serenityjs/nbt";
import { DataPacket } from "./data-packet";
import { Packet } from "../../enums";
import { Proto, Serialize } from "@serenityjs/raknet";

@Proto(Packet.SyncActorProperty)
class SyncActorPropertyPacket extends DataPacket {
  @Serialize(CompoundTag, true) public properties!: CompoundTag;
}

export { SyncActorPropertyPacket };