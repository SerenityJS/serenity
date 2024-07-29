import { DataType } from "@serenityjs/raknet";

import { NetworkItemInstanceDescriptor } from "./network-item-instance-descriptor";

import type { BinaryStream } from "@serenityjs/binarystream";

class FurnanceRecipe extends DataType {
	/**
	 * The input of the recipe.
	 */
	public readonly data: number;

	/**
	 * The result of the recipe.
	 */
	public readonly resultant: NetworkItemInstanceDescriptor;

	/**
	 * The tag of the recipe.
	 */
	public readonly tag: string;

	/**
	 * Creates an instance of FurnanceRecipe.
	 * @param data The input of the recipe.
	 * @param resultant The result of the recipe.
	 * @param tag The tag of the recipe.
	 */
	public constructor(
		data: number,
		resultant: NetworkItemInstanceDescriptor,
		tag: string
	) {
		super();
		this.data = data;
		this.resultant = resultant;
		this.tag = tag;
	}

	public static read(stream: BinaryStream): FurnanceRecipe {
		// Read the input of the recipe.
		const data = stream.readZigZag();

		// Read the result of the recipe.
		const resultant = NetworkItemInstanceDescriptor.read(stream);

		// Read the tag of the recipe.
		const tag = stream.readVarString();

		// Return the furnace recipe.
		return new FurnanceRecipe(data, resultant, tag);
	}

	public static write(stream: BinaryStream, value: FurnanceRecipe): void {
		// Write the input of the recipe.
		stream.writeZigZag(value.data);

		// Write the result of the recipe.
		NetworkItemInstanceDescriptor.write(stream, value.resultant);

		// Write the tag of the recipe.
		stream.writeVarString(value.tag);
	}
}

export { FurnanceRecipe };
