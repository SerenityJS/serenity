import { DataType } from "@serenityjs/raknet";
import {
	CompoundTag,
	FloatTag,
	ListTag,
	StringTag,
	Tag
} from "@serenityjs/nbt";

import { Vector3f } from "./vector3f";
import { Rotation } from "./rotation";

import type { BinaryStream } from "@serenityjs/binarystream";

interface ActorDataNbt {
	identifier: StringTag;
	Pos: ListTag<FloatTag>;
	Rotation: ListTag<FloatTag>;
	SerenityInternal: StringTag;
}

class ActorData extends DataType {
	public readonly identifier: string;

	public readonly position: Vector3f;

	public readonly rotation: Rotation;

	public readonly extra?: Buffer;

	public constructor(
		identifier: string,
		position: Vector3f,
		rotation: Rotation,
		extra?: Buffer
	) {
		super();
		this.identifier = identifier;
		this.position = position;
		this.rotation = rotation;
		this.extra = extra;
	}

	public static read(stream: BinaryStream): ActorData {
		// Read a CompoundTag from the stream.
		const tag = CompoundTag.read<ActorDataNbt>(stream);

		// Get the identifier.
		const identifier = tag.value.identifier.value;

		// Get the position.
		const [x, y, z] = tag.value.Pos.value;
		const position = new Vector3f(x?.value ?? 0, y?.value ?? 0, z?.value ?? 0);

		// Get the rotation.
		const [rx, ry, rz] = tag.value.Rotation.value;
		const rotation = new Rotation(
			rx?.value ?? 0,
			ry?.value ?? 0,
			rz?.value ?? 0
		);

		// Get the extra data.
		const extra = tag.value.SerenityInternal?.value ?? "";

		// Return the ActorData.
		return new ActorData(
			identifier,
			position,
			rotation,
			Buffer.from(extra, "base64")
		);
	}

	public static write(stream: BinaryStream, value: ActorData): void {
		// Write a CompoundTag to the stream.
		const tag = new CompoundTag<ActorDataNbt>();

		// Add the identifier and position to the tag.
		tag.value.identifier = new StringTag("identifier", value.identifier);

		tag.value.Pos = new ListTag<FloatTag>(
			"Pos",
			[
				new FloatTag("", value.position.x),
				new FloatTag("", value.position.y),
				new FloatTag("", value.position.z)
			],
			Tag.Float
		);

		tag.value.Rotation = new ListTag<FloatTag>(
			"Rotation",
			[
				new FloatTag("", value.rotation.yaw),
				new FloatTag("", value.rotation.pitch),
				new FloatTag("", value.rotation.headYaw)
			],
			Tag.Float
		);

		tag.value.SerenityInternal = new StringTag(
			"SerenityInternal",
			value.extra?.toString("base64") ?? ""
		);

		// Write the tag to the stream.
		CompoundTag.write(stream, tag);
	}
}

export { ActorData };
