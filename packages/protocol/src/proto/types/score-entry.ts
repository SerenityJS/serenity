import { DataType } from "@serenityjs/raknet";
import { Endianness, type BinaryStream } from "@serenityjs/binarystream";

enum ScoreEntryType {
	PLAYER = 1,
	ENTITY = 2,
	FAKE_PLAYER = 3
}

enum ScoreActionType {
	CHANGE,
	REMOVE
}

class ScoreEntry extends DataType {
	public scoreboardId: bigint;
	public objectiveName: string;
	public score: number;
	public type: ScoreEntryType;
	public entityUniqueId!: bigint | number | null;
	public customName!: string | undefined | null;

	public action!: ScoreActionType | number | undefined;

	public constructor(
		scoreboardId: bigint,
		objectiveName: string,
		score: number,
		type: ScoreEntryType,
		entityUniqueId: bigint,
		customName: string | null,
		action?: ScoreActionType | number | undefined
	) {
		super();
		this.scoreboardId = scoreboardId;
		this.objectiveName = objectiveName;
		this.score = score;
		this.type = type;
		this.entityUniqueId =
			type === ScoreEntryType.PLAYER || ScoreEntryType.ENTITY
				? entityUniqueId
				: 0n;
		this.customName = type == ScoreEntryType.FAKE_PLAYER ? customName : null;

		this.action = action ?? ScoreActionType.CHANGE;
	}

	public static read(stream: BinaryStream): Array<ScoreEntry> {
		// Prepare an array to store entries.
		const entries: Array<ScoreEntry> = [];

		// Read the action
		const action = stream.readUint8();

		// Read the number of entries.
		const amount = stream.readVarInt();

		for (let index = 0; index < amount; index++) {
			const scoreboardId = stream.readVarLong();
			const objectiveName = stream.readVarString();
			const score = stream.readInt32(Endianness.Little);

			const type = stream.readInt8();

			let entityUniqueId = 0n;
			let customName = "";

			if (action === ScoreActionType.CHANGE) {
				switch (type) {
					case ScoreEntryType.PLAYER:
					case ScoreEntryType.ENTITY: {
						entityUniqueId = stream.readVarLong();
						break;
					}
					case ScoreEntryType.FAKE_PLAYER: {
						customName = stream.readVarString();
						break;
					}
				}
			}

			// Push the entry to the array.
			entries.push(
				new ScoreEntry(
					scoreboardId,
					objectiveName,
					score,
					type,
					entityUniqueId,
					customName,
					action
				)
			);
		}

		// Return the entries.
		return entries;
	}

	public static write(stream: BinaryStream, value: Array<ScoreEntry>): void {
		stream.writeVarInt(value.length);

		for (const entry of value) {
			stream.writeVarLong(entry.scoreboardId);
			stream.writeVarString(entry.objectiveName);
			stream.writeInt32(entry.score, Endianness.Little);

			if (entry.action === ScoreActionType.CHANGE) {
				stream.writeByte(entry.type);
				switch (entry.type) {
					case ScoreEntryType.PLAYER:
					case ScoreEntryType.ENTITY: {
						stream.writeVarLong(entry.entityUniqueId as bigint);
						break;
					}
					case ScoreEntryType.FAKE_PLAYER: {
						stream.writeVarString(entry.customName as string);
						break;
					}
				}
			}
		}
	}
}

export { ScoreEntry, ScoreEntryType, ScoreActionType };
