import { Proto, Serialize } from "@serenityjs/raknet";

import { EnchantOption } from "../types/enchant-option";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlayerEnchantOptions)
class PlayerEnchantOptionsPacket extends DataPacket {
	@Serialize(EnchantOption) public enchantOptions!: Array<EnchantOption>;
}

export { PlayerEnchantOptionsPacket };
