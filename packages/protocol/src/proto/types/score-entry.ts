import { DataType } from "@serenityjs/raknet";
import { Endianness, type BinaryStream } from "@serenityjs/binarystream";

import { ScoreboardActionType, ScoreboardIdentityType } from "../../enums";

class ScoreEntry extends DataType {
	/**
	 * The global unique identifier of the scoreboard.
	 */
	public readonly scoreboardId: bigint;

	/**
	 * The name of the objective.
	 */
	public readonly objectiveName: string;

	/**
	 * The score of the entry.
	 */
	public readonly score: number;

	/**
	 * The identity type of the score entry.
	 */
	public readonly identityType!: ScoreboardIdentityType | null;

	/**
	 * The unique identifier type of the entity.
	 */
	public readonly actorUniqueId!: bigint | null;

	/**
	 * The type of the entry.
	 */
	public readonly customName!: string | null;

	/**
	 * Creates a new score entry.
	 * @param scoreboardId
	 * @param objectiveName
	 * @param score
	 * @param identityType
	 * @param actorUniqueId
	 * @param customName
	 */
	public constructor(
		scoreboardId: bigint,
		objectiveName: string,
		score: number,
		identityType: ScoreboardIdentityType | null,
		actorUniqueId: bigint | null,
		customName: string | null
	) {
		super();
		this.scoreboardId = scoreboardId;
		this.objectiveName = objectiveName;
		this.score = score;
		this.identityType = identityType;
		this.actorUniqueId = actorUniqueId;
		this.customName = customName;
	}

	public static read(
		stream: BinaryStream,
		_: Endianness,
		type: ScoreboardActionType
	): Array<ScoreEntry> {
		// Prepare an array to store entries.
		const entries: Array<ScoreEntry> = [];

		// Read the number of entries.
		const count = stream.readVarInt();

		// Loop through the entries.
		for (let index = 0; index < count; index++) {
			// Read the entries.
			const scoreboardId = stream.readVarLong();
			const objectiveName = stream.readVarString();
			const score = stream.readInt32(Endianness.Little);
			let identityType: ScoreboardIdentityType | null = null;
			let actorUniqueId: bigint | null = null;
			let customName: string | null = null;

			// Check if the action type is to change a score.
			if (type === ScoreboardActionType.Change) {
				// Read the identity type.
				identityType = stream.readByte() as ScoreboardIdentityType;

				// Switch based on the identity type.
				switch (identityType) {
					// Check if the identity type is a player or entity.
					case ScoreboardIdentityType.Player:
					case ScoreboardIdentityType.Entity: {
						actorUniqueId = stream.readZigZong();
						break;
					}

					// Check if the identity type is a fake player.
					case ScoreboardIdentityType.FakePlayer: {
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
					identityType,
					actorUniqueId,
					customName
				)
			);
		}

		// Return the entries.
		return entries;
	}

	public static write(
		stream: BinaryStream,
		value: Array<ScoreEntry>,
		_: Endianness,
		type: ScoreboardActionType
	): void {
		// Write the number of entries.
		stream.writeVarInt(value.length);

		// Loop through the entries.
		for (const entry of value) {
			// Write the entries.
			stream.writeVarLong(entry.scoreboardId);
			stream.writeVarString(entry.objectiveName);
			stream.writeInt32(entry.score, Endianness.Little);

			// Check if the action type is to change a score.
			if (type === ScoreboardActionType.Change) {
				// Write the identity type.
				stream.writeByte(entry.identityType as number);

				// Switch based on the identity type.
				switch (entry.identityType) {
					// Check if the identity type is a player or entity.
					case ScoreboardIdentityType.Player:
					case ScoreboardIdentityType.Entity: {
						stream.writeZigZong(entry.actorUniqueId as bigint);
						break;
					}

					// Check if the identity type is a fake player.
					case ScoreboardIdentityType.FakePlayer: {
						stream.writeVarString(entry.customName as string);
						break;
					}
				}
			}
		}
	}
}

export { ScoreEntry };
