import { Endianness, Float32, VarLong, VarString, ZigZong } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';
import { EntityProperties, MetadataDictionary, Vector3f, EntityAttributes, Links } from '../types/index.js';

@Packet(PacketId.AddEntity)
class AddEntity extends DataPacket {
	@Serialize(ZigZong) public uniqueEntityId!: bigint;
	@Serialize(VarLong) public runtimeId!: bigint;
	@Serialize(VarString) public identifier!: string;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(Vector3f) public velocity!: Vector3f;
	@Serialize(Float32, Endianness.Little) public pitch!: number;
	@Serialize(Float32, Endianness.Little) public yaw!: number;
	@Serialize(Float32, Endianness.Little) public headYaw!: number;
	@Serialize(Float32, Endianness.Little) public bodyYaw!: number;
	@Serialize(EntityAttributes) public attributes!: EntityAttributes[];
	@Serialize(MetadataDictionary) public metadata!: MetadataDictionary[];
	@Serialize(EntityProperties) public properties!: EntityProperties;
	@Serialize(Links) public links!: Links[];
}

export { AddEntity };
