import { CompoundTag } from "@serenityjs/nbt";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.AvailableActorIdentifiers)
class AvailableActorIdentifiersPacket extends DataPacket {
  @Serialize(CompoundTag, { varint: true }) public data!: CompoundTag;
}

export { AvailableActorIdentifiersPacket };
