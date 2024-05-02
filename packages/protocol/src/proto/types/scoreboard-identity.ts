import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class ScoreboardIdentity extends DataType {
	public scoreboardId: bigint;
	public entityUniqueId: bigint;

	public constructor(scoreboardId: bigint, entityUniqueId: bigint) {
		super();
		this.scoreboardId = scoreboardId;
		this.entityUniqueId = entityUniqueId;
	}

	public static read(stream: BinaryStream): Array<ScoreboardIdentity> {
		// Prepare an array to store entries.
		const entries: Array<ScoreboardIdentity> = [];

		// Read the number of entries.
		const amount = stream.readVarInt();

		for (let index = 0; index < amount; index++) {
			const scoreboardId = stream.readVarLong();
			const entityUniqueId = stream.readVarLong();

			// Push the entry to the array.
			entries.push(new ScoreboardIdentity(scoreboardId, entityUniqueId));
		}

		// Return the entries.
		return entries;
	}

	public static write(
		stream: BinaryStream,
		value: Array<ScoreboardIdentity>
	): void {
		stream.writeVarInt(value.length);

		for (const entry of value) {
			stream.writeVarLong(entry.scoreboardId);
			stream.writeVarLong(entry.entityUniqueId as bigint);
		}
	}
}

export { ScoreboardIdentity };
