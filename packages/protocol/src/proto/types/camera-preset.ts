import { DataType } from "@serenityjs/raknet";
import {
	Bool,
	Endianness,
	Float32,
	Uint8,
	type BinaryStream
} from "@serenityjs/binarystream";

import { Optional } from "./optional";

import type { Vector2f } from "./vector2f";
import type { Vector3f } from "./vector3f";
import type { CameraAudioListener } from "../../enums";

class CameraPreset extends DataType {
	public name: string;
	public parent: string;
	public position?: Vector3f;
	public rotation?: Vector2f;
	public listener?: CameraAudioListener;
	public effects?: boolean;

	public constructor(
		name: string,
		parent: string,
		position?: Vector3f,
		rotation?: Vector2f,
		listener?: CameraAudioListener,
		effects?: boolean
	) {
		super();
		this.name = name;
		this.parent = parent;
		this.position = position;
		this.rotation = rotation;
		this.listener = listener;
		this.effects = effects;
	}

	public static read(
		_stream: BinaryStream,
		_endian?: Endianness,
		_parameter?: unknown
	): void {}

	public static write(
		stream: BinaryStream,
		presets: Array<CameraPreset>
	): void {
		stream.writeVarInt(presets.length);

		for (const preset of presets) {
			stream.writeVarString(preset.name);
			stream.writeVarString(preset.parent);
			Optional.write(
				stream,
				preset.position?.x,
				Endianness.Little,
				null,
				Float32
			);
			Optional.write(
				stream,
				preset.position?.y,
				Endianness.Little,
				null,
				Float32
			);
			Optional.write(
				stream,
				preset.position?.z,
				Endianness.Little,
				null,
				Float32
			);
			Optional.write(
				stream,
				preset.position?.x,
				Endianness.Little,
				null,
				Float32
			);
			Optional.write(
				stream,
				preset.position?.y,
				Endianness.Little,
				null,
				Float32
			);
			Optional.write(stream, preset.listener, undefined, null, Uint8);
			Optional.write(stream, preset.effects, undefined, null, Bool);
		}
	}
}

export { CameraPreset };
