import { ScoreboardIdentityType } from "@serenityjs/protocol";

import { Entity } from "../entity";

class ScoreboardIdentity {
	/**
	 * The running identifier of the scoreboard identity.
	 */
	public static IDENTIFIER = 10_000n;

	/**
	 * The identifier of the scoreboard identity.
	 */
	public readonly identifier = ScoreboardIdentity.IDENTIFIER++;

	/**
	 * The scoreboard identity type.
	 */
	public readonly type: ScoreboardIdentityType;

	/**
	 * The display name of the identity.
	 */
	public readonly displayName: string;

	/**
	 * The entity of the identity.
	 */
	public readonly entity: Entity | null = null;

	/**
	 * Creates a new scoreboard identity.
	 * @param value The entity or display name of the identity.
	 */
	public constructor(value: Entity | string) {
		// Check if the value is an entity.
		if (value instanceof Entity) {
			// Check if the entity is a player.
			if (value.isPlayer()) {
				this.type = ScoreboardIdentityType.Player;
				this.displayName = value.username;
			} else {
				this.type = ScoreboardIdentityType.Entity;
				this.displayName = value.type.identifier;
			}

			// Set the entity of the identity.
			this.identifier = value.runtime;
			this.entity = value;
		} else {
			// Set the type to fake player and set the display name.
			this.type = ScoreboardIdentityType.FakePlayer;
			this.displayName = value;
		}
	}
}

export { ScoreboardIdentity };
