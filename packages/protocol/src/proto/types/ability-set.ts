import { DataType } from "@serenityjs/raknet";
import { type BinaryStream, Endianness } from "@serenityjs/binarystream";

import { AbilityIndex } from "../../enums";

class AbilitySet extends DataType {
	/**
	 * The ability index of the flag.
	 */
	public readonly ability: AbilityIndex;

	/**
	 * The value of the flag.
	 */
	public readonly value: boolean;

	/**
	 * Creates a new ability flag.
	 * @param ability The ability index of the flag.
	 * @param value The value of the flag
	 */
	public constructor(ability: AbilityIndex, value: boolean) {
		super();
		this.ability = ability;
		this.value = value;
	}

	public static read(stream: BinaryStream): Array<AbilitySet> {
		// Prepare an array to store the flags
		const flags: Array<AbilitySet> = [];

		// Read the available and enabled flags
		const available = stream.readUint32(Endianness.Little);
		const enabled = stream.readUint32(Endianness.Little);

		// Iterate through all the flags
		for (const ability of Object.values(AbilityIndex)) {
			// Check if the flag is available
			if ((available & (1 << (ability as AbilityIndex))) === 0) continue;

			// Check if the flag is enabled
			const value = (enabled & (1 << (ability as AbilityIndex))) !== 0;

			// Push the flag to the array
			flags.push(new AbilitySet(ability as AbilityIndex, value));
		}

		// Return the flags
		return flags;
	}

	public static write(stream: BinaryStream, flags: Array<AbilitySet>): void {
		// Prepare the hashes
		let available = 0;
		let enabled = 0;

		// Iterate through all the flags
		for (const { ability, value } of flags) {
			// Set the flag hash
			available |= 1 << ability;

			// Set the value hash
			enabled |= value ? 1 << ability : 0;
		}

		// Write the flags to the stream
		stream.writeUint32(available, Endianness.Little);
		stream.writeUint32(enabled, Endianness.Little);
	}
}

export { AbilitySet };
