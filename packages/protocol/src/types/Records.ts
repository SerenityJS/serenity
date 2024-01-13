import type { Buffer } from 'node:buffer';
import type { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import { RecordAction } from '../enums';

interface Record {
	buildPlatform?: number;
	entityUniqueId?: bigint;
	isHost?: boolean;
	isTeacher?: boolean;
	platformChatId?: string;
	skin?: Buffer;
	username?: string;
	uuid: string;
	xuid?: string;
}

class Records extends DataType {
	public static override read(stream: BinaryStream, endian: Endianness, action: RecordAction): Record[] {
		// Prepare an array to store the records.
		const records: Record[] = [];

		// Read the number of records.
		const amount = stream.readVarInt();

		// We then loop through the amount of records.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// First we read the uuid field.
			// This will always be present either way.
			const uuid = stream.readUuid();

			// First we check the action type.
			if (action === RecordAction.Add) {
				// Read all the fields for the record.
				const entityUniqueId = stream.readZigZong();
				const username = stream.readVarString();
				const xuid = stream.readVarString();
				const platformChatId = stream.readVarString();
				const buildPlatform = stream.readInt32(endian);
				const skinLength = stream.getBuffer().byteLength - stream.offset - amount - 2;
				const skin = stream.readBuffer(skinLength);
				const isTeacher = stream.readBool();
				const isHost = stream.readBool();

				// Push the record to the array.
				records.push({
					buildPlatform,
					entityUniqueId,
					isHost,
					isTeacher,
					platformChatId,
					skin,
					username,
					uuid,
					xuid,
				});
			} else {
				// We only push the uuid to the array.
				// This is because the other fields are not present.
				records.push({
					uuid,
				});
			}
		}

		// Return the records.
		return records;
	}

	public static override write(stream: BinaryStream, value: Record[], endian: Endianness, action: RecordAction): void {
		// Write the number of records.
		stream.writeVarInt(value.length);

		// Loop through the records.
		for (const record of value) {
			// Write the uuid field.
			stream.writeUuid(record.uuid);

			// Check the action type.
			if (action === RecordAction.Add) {
				// Write all the fields for the record.
				stream.writeZigZong(record.entityUniqueId!);
				stream.writeVarString(record.username!);
				stream.writeVarString(record.xuid!);
				stream.writeVarString(record.platformChatId!);
				stream.writeInt32(record.buildPlatform!, endian);
				stream.writeBuffer(record.skin!);
				stream.writeBool(record.isTeacher!);
				stream.writeBool(record.isHost!);
			}
		}

		// For some reason, the client expects a boolean at the end of the packet.
		// This is to indicate that the records are verified.
		if (action === RecordAction.Add) {
			for (const _ of value) {
				stream.writeBool(true);
			}
		}
	}
}

export { Records, type Record };
