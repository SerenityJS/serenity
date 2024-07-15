import { DataType } from "@serenityjs/raknet";
import { type BinaryStream, Endianness } from "@serenityjs/binarystream";
import { CompoundTag } from "@serenityjs/nbt";

import { type ActorDataId, ActorDataType } from "../../enums";

import { BlockCoordinates } from "./block-coordinates";
import { Vector3f } from "./vector3f";

class DataItem<T = unknown> extends DataType {
	/**
	 * The identifier of the data item.
	 */
	public readonly identifier: ActorDataId;

	/**
	 * The type of the data item.
	 */
	public readonly type: ActorDataType;

	/**
	 * The value of the data item.
	 */
	public readonly value: T;

	/**
	 * Creates a new data item.
	 * @param identifier The identifier of the data item.
	 * @param type The type of the data item.
	 * @param value The value of the data item.
	 */
	public constructor(identifier: ActorDataId, type: ActorDataType, value: T) {
		super();

		this.identifier = identifier;
		this.type = type;
		this.value = value;
	}

	public static override read(stream: BinaryStream): Array<DataItem> {
		// Prepare an array to store the data items.
		const items: Array<DataItem> = [];

		// Read the number of data items.
		const amount = stream.readVarInt();

		// Iterate through the amount of data items.
		for (let index = 0; index < amount; index++) {
			// Read the identifier of the data item.
			const identifier = stream.readVarInt();

			// Read the type of the data item.
			const type = stream.readVarInt();

			// Read the value of the data item.
			let value: unknown;
			switch (type) {
				case ActorDataType.Byte: {
					value = stream.readInt8();
					break;
				}

				case ActorDataType.Short: {
					value = stream.readInt16(Endianness.Little);
					break;
				}

				case ActorDataType.Int: {
					value = stream.readZigZag();
					break;
				}

				case ActorDataType.Float: {
					value = stream.readFloat32(Endianness.Little);
					break;
				}

				case ActorDataType.String: {
					value = stream.readVarString();
					break;
				}

				case ActorDataType.CompoundTag: {
					value = CompoundTag.read(stream);
					break;
				}

				case ActorDataType.BlockPos: {
					value = BlockCoordinates.read(stream);
					break;
				}

				case ActorDataType.Long: {
					value = stream.readZigZong();
					break;
				}

				case ActorDataType.Vec3: {
					value = Vector3f.read(stream);
					break;
				}
			}

			// Push the data item to the array.
			items.push(new DataItem(identifier, type, value));
		}

		// Return the data items.
		return items;
	}

	public static override write(
		stream: BinaryStream,
		data: Array<DataItem>
	): void {
		// Write the number of data items.
		stream.writeVarInt(data.length);

		// Iterate through the data items.
		for (const item of data) {
			// Write the identifier of the data item.
			stream.writeVarInt(item.identifier);

			// Write the type of the data item.
			stream.writeVarInt(item.type);

			// Write the value of the data item.
			switch (item.type) {
				case ActorDataType.Byte: {
					stream.writeInt8(item.value as number);
					break;
				}

				case ActorDataType.Short: {
					stream.writeInt16(item.value as number, Endianness.Little);
					break;
				}

				case ActorDataType.Int: {
					stream.writeZigZag(item.value as number);
					break;
				}

				case ActorDataType.Float: {
					stream.writeFloat32(item.value as number, Endianness.Little);
					break;
				}

				case ActorDataType.String: {
					stream.writeVarString(item.value as string);
					break;
				}

				case ActorDataType.CompoundTag: {
					CompoundTag.write(stream, item.value as CompoundTag);
					break;
				}

				case ActorDataType.BlockPos: {
					BlockCoordinates.write(stream, item.value as BlockCoordinates);
					break;
				}

				case ActorDataType.Long: {
					stream.writeZigZong(item.value as bigint);
					break;
				}

				case ActorDataType.Vec3: {
					Vector3f.write(stream, item.value as Vector3f);
					break;
				}
			}
		}
	}
}

export { DataItem };
