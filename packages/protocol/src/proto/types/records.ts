import { DataType } from "@serenityjs/raknet";

import { RecordAction } from "../../enums";

import type { Buffer } from "node:buffer";
import type { BinaryStream, Endianness } from "@serenityjs/binaryutils";

class Records extends DataType {
	public buildPlatform?: number;
	public entityUniqueId?: bigint;
	public isHost?: boolean;
	public isTeacher?: boolean;
	public isSubclient?: boolean;
	public platformChatId?: string;
	public skin?: Buffer;
	public username?: string;
	public uuid: string;
	public xuid?: string;

	public constructor(
		uuid: string,
		buildPlatform?: number,
		entityUniqueId?: bigint,
		isHost?: boolean,
		isTeacher?: boolean,
		isSubclient?: boolean,
		platformChatId?: string,
		skin?: Buffer,
		username?: string,
		xuid?: string
	) {
		super();
		this.buildPlatform = buildPlatform;
		this.entityUniqueId = entityUniqueId;
		this.isHost = isHost;
		this.isTeacher = isTeacher;
		this.isSubclient = isSubclient;
		this.platformChatId = platformChatId;
		this.skin = skin;
		this.username = username;
		this.uuid = uuid;
		this.xuid = xuid;
	}

	public static override read(
		stream: BinaryStream,
		endian: Endianness,
		action: RecordAction
	): Array<Records> {
		// Prepare an array to store the records.
		const records: Array<Records> = [];

		// Read the number of records.
		const amount = stream.readVarInt();

		// We then loop through the amount of records.
		// Reading the individual fields in the stream.
		for (let index = 0; index < amount; index++) {
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
				const skinLength =
					stream.getBuffer().byteLength - stream.offset - amount - 2;
				const skin = stream.readBuffer(skinLength);
				const isTeacher = stream.readBool();
				const isHost = stream.readBool();
				const isSubclient = stream.readBool();

				// Push the record to the array.
				records.push(
					new Records(
						uuid,
						buildPlatform,
						entityUniqueId,
						isHost,
						isTeacher,
						isSubclient,
						platformChatId,
						skin,
						username,
						xuid
					)
				);
			} else {
				// We only push the uuid to the array.
				// This is because the other fields are not present.
				records.push({
					uuid
				});
			}
		}

		// Return the records.
		return records;
	}

	public static override write(
		stream: BinaryStream,
		value: Array<Records>,
		endian: Endianness,
		action: RecordAction
	): void {
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
				stream.writeBool(record.isSubclient!);
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

export { Records };
