import { VarString, ZigZag } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId, ViolationSeverity, ViolationType } from '../enums/index.js';

@Packet(PacketId.PacketViolationWarning)
class PacketViolationWarning extends DataPacket {
	@Serialize(ZigZag) public type!: ViolationType;
	@Serialize(ZigZag) public severity!: ViolationSeverity;
	@Serialize(ZigZag) public packetId!: PacketId;
	@Serialize(VarString) public context!: string;
}

export { PacketViolationWarning };
