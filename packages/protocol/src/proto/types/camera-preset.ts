import { DataType } from "@serenityjs/raknet";
import {
	Bool,
	Endianness,
	Float32,
	Uint8,
	type BinaryStream
} from "@serenityjs/binarystream";

import { Optional } from "./optional";
import { Vector3f } from "./vector3f";
import { Vector2f } from "./vector2f";

import type { CameraAudioListener } from "../../enums";

class CameraPreset extends DataType {
	public name: string;
	public parent: string;
	public position?: Vector3f;
	public rotation?: Vector2f;
	public viewOffset?: Vector2f;
	public radius?: number;
	public listener?: CameraAudioListener;
	public effects?: boolean;

	public constructor(
		name: string,
		parent: string,
		position?: Vector3f,
		rotation?: Vector2f,
		viewOffset?: Vector2f,
		radius?: number,
		listener?: CameraAudioListener,
		effects?: boolean
	) {
		super();
		this.name = name;
		this.parent = parent;
		this.position = position;
		this.rotation = rotation;
		this.viewOffset = viewOffset;
		this.radius = radius;
		this.listener = listener;
		this.effects = effects;
	}

	public static read(stream: BinaryStream): Array<CameraPreset> {
		const size = stream.readVarInt();
		const presets: Array<CameraPreset> = [];

		for (let index = 0; index < size; index++) {
			presets.push(
				new CameraPreset(
					stream.readVarString(),
					stream.readVarString(),
					new Vector3f(
						Optional.read(
							stream,
							Endianness.Little,
							undefined,
							Float32
						) as number,
						Optional.read(
							stream,
							Endianness.Little,
							undefined,
							Float32
						) as number,
						Optional.read(
							stream,
							Endianness.Little,
							undefined,
							Float32
						) as number
					),
					new Vector2f(
						Optional.read(
							stream,
							Endianness.Little,
							undefined,
							Float32
						) as number,
						Optional.read(
							stream,
							Endianness.Little,
							undefined,
							Float32
						) as number
					),
					new Vector2f(
						Optional.read(
							stream,
							Endianness.Little,
							undefined,
							Float32
						) as number,
						Optional.read(
							stream,
							Endianness.Little,
							undefined,
							Float32
						) as number
					),
					Optional.read(
						stream,
						Endianness.Little,
						undefined,
						Float32
					) as number,
					Optional.read(
						stream,
						undefined,
						undefined,
						Uint8
					) as CameraAudioListener,
					Optional.read(stream, undefined, undefined, Bool) as boolean
				)
			);
		}
		return presets;
	}

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
				preset.rotation?.x,
				Endianness.Little,
				null,
				Float32
			);
			Optional.write(
				stream,
				preset.rotation?.y,
				Endianness.Little,
				null,
				Float32
			);
			Optional.write(
				stream,
				preset.viewOffset,
				Endianness.Little,
				null,
				Vector2f
			);
			Optional.write(stream, preset.radius, Endianness.Little, null, Float32);
			Optional.write(stream, preset.listener, undefined, null, Uint8);
			Optional.write(stream, preset.effects, undefined, null, Bool);
		}
	}
}

export { CameraPreset };
