import type { IPosition } from "@serenityjs/protocol";

interface PlayerSoundOptions {
	/**
	 * The position the sound should be played at.
	 */
	position?: IPosition;

	/**
	 * The volume th sound should be played at.
	 */
	volume?: number;

	/**
	 * The pitch the sound should be played at.
	 */
	pitch?: number;
}

export { PlayerSoundOptions };
