import { DataType } from "@serenityjs/raknet";

import { BlockCoordinates } from "./block-coordinates";
import { Vector3f } from "./vector3f";

import type { BinaryStream } from "@serenityjs/binarystream";

class StructureSettings extends DataType {
	public structurePalletName: string;
	public ignoreEntities: boolean;
	public ignoreBlocks: boolean;
	public allowNonTicking: boolean;
	public size: BlockCoordinates;
	public offset: BlockCoordinates;
	public lastEdit: bigint;
	public rotation: number;
	public mirror: number;
	public animationMode: number;
	public animationSeconds: number;
	public integrityValue: number;
	public integritySeed: number;
	public rotationPivot: Vector3f;

	public constructor(
		structurePalletName: string,
		ignoreEntities: boolean,
		ignoreBlocks: boolean,
		allowNonTicking: boolean,
		size: BlockCoordinates,
		offset: BlockCoordinates,
		lastEdit: bigint,
		rotation: number,
		mirror: number,
		animationMode: number,
		animationSeconds: number,
		integrityValue: number,
		integritySeed: number,
		rotationPivot: Vector3f
	) {
		super();
		this.structurePalletName = structurePalletName;
		this.ignoreEntities = ignoreEntities;
		this.ignoreBlocks = ignoreBlocks;
		this.allowNonTicking = allowNonTicking;
		this.size = size;
		this.offset = offset;
		this.lastEdit = lastEdit;
		this.rotation = rotation;
		this.mirror = mirror;
		this.animationMode = animationMode;
		this.animationSeconds = animationSeconds;
		this.integrityValue = integrityValue;
		this.integritySeed = integritySeed;
		this.rotationPivot = rotationPivot;
	}

	public static write(stream: BinaryStream, value: StructureSettings): void {
		stream.writeVarString(value.structurePalletName);
		stream.writeBool(value.ignoreBlocks);
		stream.writeBool(value.ignoreEntities);
		stream.writeBool(value.allowNonTicking);
		BlockCoordinates.write(stream, value.size);
		BlockCoordinates.write(stream, value.offset);
		stream.writeZigZong(value.lastEdit);
		stream.writeByte(value.animationMode);
		stream.writeFloat32(value.animationSeconds);
		stream.writeFloat32(value.integrityValue);
		stream.writeUint32(value.integritySeed);
		Vector3f.write(stream, value.rotationPivot);
	}

	public static read(stream: BinaryStream): StructureSettings {
		return new StructureSettings(
			stream.readVarString(), // ? Structure Pallet Name
			stream.readBool(), // ? Ignore entities
			stream.readBool(), // ? Ignore Blocks
			stream.readBool(), // ? Allow non tick
			BlockCoordinates.read(stream), // ? Size
			BlockCoordinates.read(stream), // ? Offset
			stream.readZigZong(), // ? Last Edit Unique ID
			stream.readByte(), // ? Rotation
			stream.readByte(), // ? Mirror
			stream.readByte(), // ? Animation Mode
			stream.readFloat32(), // ? Animation Seconds
			stream.readFloat32(), // ? Integrity value
			stream.readUint32(), // ? Integrity seed
			Vector3f.read(stream) // ? Rotation Pivot
		);
	}
}

export { StructureSettings };
