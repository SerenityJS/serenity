import { Endianness } from "@serenityjs/binaryutils";
import { DataType } from "@serenityjs/raknet";

import { MetadataType, MetadataKey } from "../../enums";

import { Vector3f } from "./vector3f";

import type { MetadataFlags } from "../../enums";
import type { BinaryStream } from "@serenityjs/binaryutils";

class MetadataDictionary extends DataType {
	public flag?: MetadataFlags;
	public key: MetadataKey;
	public type: MetadataType;
	public value: Vector3f | bigint | boolean | number | string;

	public constructor(
		key: MetadataKey,
		type: MetadataType,
		value: Vector3f | bigint | boolean | number | string,
		flag?: MetadataFlags
	) {
		super();
		this.key = key;
		this.type = type;
		this.value = value;
		this.flag = flag;
	}

	public static override read(stream: BinaryStream): Array<MetadataDictionary> {
		// Prepare an array to store the metadata.
		const metadata: Array<MetadataDictionary> = [];

		// Read the number of metadata.
		const amount = stream.readVarInt();

		// We then loop through the amount of metadata.
		// Reading the individual fields in the stream.
		for (let index = 0; index < amount; index++) {
			// Read the key for the metadata.
			const key = stream.readVarInt();

			// Check if the key is a flag.
			if (key === MetadataKey.Flags || key === MetadataKey.FlagsExtended) {
				// Read the type for the metadata.
				const type = stream.readByte();

				// Check if the type is a long.
				if (type === MetadataType.Long) {
					// Read the value for the metadata.
					const value = stream.readZigZong();

					// Push the metadata to the array.
					metadata.push({
						key,
						type,
						value
					});
				}
			} else {
				// Read the type for the metadata.
				const type = stream.readByte();

				// Read the value for the metadata.
				let value: Vector3f | bigint | boolean | number | string = 0;
				switch (type) {
					case MetadataType.Byte: {
						value = stream.readByte();
						break;
					}
					case MetadataType.Short: {
						value = stream.readInt16(Endianness.Little);
						break;
					}
					case MetadataType.Int: {
						value = stream.readZigZag();
						break;
					}
					case MetadataType.Float: {
						value = stream.readFloat32(Endianness.Little);
						break;
					}
					case MetadataType.String: {
						value = stream.readVarString();
						break;
					}
					case MetadataType.Compound: {
						break;
					}
					case MetadataType.Vec3int: {
						break;
					}
					case MetadataType.Long: {
						value = stream.readZigZong();
						break;
					}
					case MetadataType.Vec3f: {
						value = Vector3f.read(stream);
						break;
					}
				}

				// Push the metadata to the array.
				metadata.push(new MetadataDictionary(key, type, value));
			}
		}

		// Return the metadata.
		return metadata;
	}

	// TODO: Finish this
	public static override write(
		stream: BinaryStream,
		value: Array<MetadataDictionary>
	): void {
		// Write the number of metadata given in the array.
		stream.writeVarInt(value.length);

		// Create a flag keysets.
		let flagKeyset1 = 0n;
		let flagKeyset2 = 0n;

		// Loop through the metadata.
		for (const metadata of value) {
			// Write the key for the metadata.
			stream.writeVarInt(metadata.key);

			// Check if the metadata is a flag.
			if (metadata.key === MetadataKey.Flags && metadata.flag) {
				// Write the type for the metadata.
				// In this case, the type is a long.
				stream.writeByte(MetadataType.Long);

				// Create a new value for the flag.
				const value = (metadata.value as boolean)
					? flagKeyset1 ^ (1n << BigInt(metadata.flag))
					: flagKeyset1 ^ (0n << BigInt(metadata.flag));

				// Write the value for the metadata.
				// And set the flagKeyset1 to the value.
				stream.writeZigZong(value);
				flagKeyset1 = value;
			} else if (metadata.key === MetadataKey.FlagsExtended && metadata.flag) {
				// Write the type for the metadata.
				// In this case, the type is a long.
				stream.writeByte(MetadataType.Long);

				// Create a new value for the flag.
				const value = (metadata.value as boolean)
					? flagKeyset2 ^ (1n << BigInt(metadata.flag))
					: flagKeyset2 ^ (0n << BigInt(metadata.flag));

				// Write the value for the metadata.
				// And set the flagKeyset1 to the value.
				stream.writeZigZong(value);
				flagKeyset2 = value;
			} else {
				// Write the fields for the metadata.
				stream.writeByte(metadata.type);

				// Convert the value to a number if it's a boolean.
				const value =
					metadata.value === true
						? 1
						: metadata.value === false
							? 0
							: metadata.value;

				// Write the value for the metadata.
				switch (metadata.type) {
					case MetadataType.Byte: {
						stream.writeByte(value as number);
						break;
					}
					case MetadataType.Short: {
						stream.writeInt16(value as number, Endianness.Little);
						break;
					}
					case MetadataType.Int: {
						stream.writeZigZag(value as number);
						break;
					}
					case MetadataType.Float: {
						stream.writeFloat32(value as number, Endianness.Little);
						break;
					}
					case MetadataType.String: {
						stream.writeVarString(value as string);
						break;
					}
					case MetadataType.Compound: {
						break;
					}
					case MetadataType.Vec3int: {
						break;
					}
					case MetadataType.Long: {
						stream.writeZigZong(value as bigint);
						break;
					}
					case MetadataType.Vec3f: {
						Vector3f.write(stream, value as Vector3f);
						break;
					}
				}
			}
		}
	}
}

export { MetadataDictionary };
