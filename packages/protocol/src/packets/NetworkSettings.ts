import { Bool, Endianness, Float32, Short, Uint8 } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { CompressionMethod, Packet as PacketId } from '../enums/index.js';

@Packet(PacketId.NetworkSettings)
class NetworkSettings extends DataPacket {
	@Serialize(Short, Endianness.Little) public compressionThreshold!: number;
	@Serialize(Short, Endianness.Little) public compressionMethod!: CompressionMethod;
	@Serialize(Bool) public clientThrottle!: boolean;
	@Serialize(Uint8) public clientThreshold!: number;
	@Serialize(Float32, Endianness.Little) public clientScalar!: number;
}

export { NetworkSettings };
