import { Bool } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.UpdateAdventureSettings)
class UpdateAdventureSettingsPacket extends DataPacket {
	@Serialize(Bool) public noPvm!: boolean;
	@Serialize(Bool) public noPvp!: boolean;
	@Serialize(Bool) public immutableWorld!: boolean;
	@Serialize(Bool) public showNameTags!: boolean;
	@Serialize(Bool) public autoJump!: boolean;
}

export { UpdateAdventureSettingsPacket };
