import { VarString } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';

@Packet(PacketId.ScriptMessage)
class ScriptMessage extends DataPacket {
	@Serialize(VarString) public messageId!: string;
	@Serialize(VarString) public data!: string;
}

export { ScriptMessage };
