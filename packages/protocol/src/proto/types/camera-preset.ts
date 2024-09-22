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
	public speed?: number;
	public snapToTarget?: boolean;
	public viewOffset?: Vector2f;
	public entityOffset?: Vector3f;
	public radius?: number;
	public listener?: CameraAudioListener;
	public effects?: boolean;

	public constructor(
		name: string,
		parent: string,
		position?: Vector3f,
		rotation?: Vector2f,
		speed?: number,
		snapToTarget?: boolean,
		viewOffset?: Vector2f,
		entityOffset?: Vector3f,
		radius?: number,
		listener?: CameraAudioListener,
		effects?: boolean
	) {
		super();
		this.name = name;
		this.parent = parent;
		this.position = position;
		this.rotation = rotation;
		this.speed = speed;
		this.snapToTarget = snapToTarget;
		this.viewOffset = viewOffset;
		this.entityOffset = entityOffset;
		this.radius = radius;
		this.listener = listener;
		this.effects = effects;
	}


	public static read(stream: BinaryStream): Array<CameraPreset> {
		const presets: Array<CameraPreset> = [];
		const size = stream.readVarInt();

		for (let index = 0; index < size; index++) {
			presets.push(
				new CameraPreset(
					stream.readVarString(), // name
					stream.readVarString(), // parent
					new Vector3f( // position
						Optional.read(stream, Endianness.Little, undefined, Float32) as number,
						Optional.read(stream, Endianness.Little, undefined, Float32) as number,
						Optional.read(stream, Endianness.Little, undefined, Float32) as number
					),
					new Vector2f( // rotation
						Optional.read(stream, Endianness.Little, undefined, Float32) as number,
						Optional.read(stream, Endianness.Little, undefined, Float32) as number
					),
					Optional.read(stream, Endianness.Little, undefined, Float32) as number, // speed
					Optional.read(stream, undefined, undefined, Bool) as boolean, // snapToTarget
					Optional.read(stream, undefined, undefined, Vector2f) as Vector2f, // viewOffset
					Optional.read(stream, undefined, undefined, Vector3f) as Vector3f, // entityOffset
					Optional.read(stream, Endianness.Little, undefined, Float32) as number, // radius
					Optional.read(stream, undefined, undefined, Uint8) as CameraAudioListener, // listener
					Optional.read(stream, undefined, undefined, Bool) as boolean // effects
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

			Optional.write(stream, preset.position?.x, Endianness.Little, null, Float32); // position x

			Optional.write(stream, preset.position?.y, Endianness.Little, null, Float32); // position y

			Optional.write(stream, preset.position?.z, Endianness.Little, null, Float32); // position z

			Optional.write(stream, preset.rotation?.x, Endianness.Little, null, Float32); // rotation x

			Optional.write(stream, preset.rotation?.y, Endianness.Little, null, Float32); // rotation y

			Optional.write(stream, preset.speed, Endianness.Little, null, Float32); // speed

			Optional.write(stream, preset.snapToTarget, undefined, null, Bool); // snapToTarget

			Optional.write(stream, preset.viewOffset, undefined, null, Vector2f); // viewOffset

			Optional.write(stream, preset.entityOffset, undefined, null, Vector3f); // entityOffset

			Optional.write(stream, preset.radius, Endianness.Little, null, Float32); // radius

			Optional.write(stream, preset.listener, undefined, null, Uint8); // listener

			Optional.write(stream, preset.effects, undefined, null, Bool); // effects
		}
	}
}

export { CameraPreset };
