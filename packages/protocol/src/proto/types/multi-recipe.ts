import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class MultiRecipe extends DataType {
	/**
	 * The uuid of the recipe.
	 */
	public readonly uuid: string;

	/**
	 * The network id of the recipe.
	 */
	public readonly networkId: number;

	/**
	 * Creates an instance of MultiRecipe.
	 * @param uuid The uuid of the recipe.
	 * @param networkId The network id of the recipe.
	 */
	public constructor(uuid: string, networkId: number) {
		super();
		this.uuid = uuid;
		this.networkId = networkId;
	}

	public static read(stream: BinaryStream): MultiRecipe {
		// Read the uuid of the recipe.
		const uuid = stream.readUuid();

		// Read the network id of the recipe.
		const networkId = stream.readVarInt();

		// Return the multi recipe.
		return new this(uuid, networkId);
	}

	public static write(stream: BinaryStream, value: MultiRecipe): void {
		// Write the uuid of the recipe.
		stream.writeUuid(value.uuid);

		// Write the network id of the recipe.
		stream.writeVarInt(value.networkId);
	}
}

export { MultiRecipe };
