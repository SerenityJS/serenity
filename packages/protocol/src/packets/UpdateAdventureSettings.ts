import { Bool } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';

@Packet(PacketId.UpdateAdventureSettings)
class UpdateAdventureSettings extends DataPacket {
	@Serialize(Bool) public noPvm!: boolean;
	@Serialize(Bool) public noPvp!: boolean;
	@Serialize(Bool) public immutableWorld!: boolean;
	@Serialize(Bool) public showNameTags!: boolean;
	@Serialize(Bool) public autoJump!: boolean;
}

export { UpdateAdventureSettings };
