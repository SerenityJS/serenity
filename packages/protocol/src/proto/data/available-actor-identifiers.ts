import { Proto, Serialize } from "@serenityjs/raknet";
import { CompoundTag } from "@serenityjs/nbt";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.AvailableActorIdentifiers)
class AvailableActorIdentifiersPacket extends DataPacket {
	@Serialize(CompoundTag, true) public data!: CompoundTag<unknown>;
}

export { AvailableActorIdentifiersPacket };
