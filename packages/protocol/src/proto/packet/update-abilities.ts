import { Endianness, Int64, Uint8 } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { CommandPermissionLevel, Packet, PermissionLevel } from "../../enums";
import { AbilityLayers } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.UpdateAbilities)
class UpdateAbilities extends DataPacket {
	@Serialize(Int64, Endianness.Little) public entityUniqueId!: bigint;
	@Serialize(Uint8) public permissionLevel!: PermissionLevel;
	@Serialize(Uint8) public commandPersmissionLevel!: CommandPermissionLevel;
	@Serialize(AbilityLayers) public abilities!: Array<AbilityLayers>;
}

export { UpdateAbilities };
