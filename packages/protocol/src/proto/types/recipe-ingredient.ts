import { DataType } from "@serenityjs/raknet";
import { type BinaryStream, Endianness } from "@serenityjs/binarystream";

import { InternalType } from "../../enums";

interface RecipeIngredientDefault {
	networkId: number;
	metadata: number;
}

interface RecipeIngredientMolang {
	molang: string;
	version: number;
}

interface RecipeIngredientItemTag {
	tag: string;
}

interface RecipeIngredientDeferred {
	name: string;
	metadata: number;
}

interface RecipeIngredientComplexAlias {
	name: string;
}

// WHY
class RecipeIngredient extends DataType {
	/**
	 * The type of the ingredient.
	 */
	public readonly type: InternalType;

	/**
	 * If the ingredient is a default item, this is the item's network ID and metadata.
	 */
	public readonly default: RecipeIngredientDefault | null;

	/**
	 * If the ingredient is a molang item, this is the molang string and version
	 */
	public readonly molang: RecipeIngredientMolang | null;

	/**
	 * If the ingredient is an item tag, this is the tag.
	 */
	public readonly itemTag: RecipeIngredientItemTag | null;

	/**
	 * If the ingredient is a deferred item, this is the name and metadata.
	 */
	public readonly deferred: RecipeIngredientDeferred | null;

	/**
	 * If the ingredient is a complex alias, this is the name
	 */
	public readonly complexAlias: RecipeIngredientComplexAlias | null;

	/**
	 * The stack size of the ingredient
	 */
	public readonly stackSize: number;

	/**
	 * Constructor for the RecipeIngredient class
	 * @param type The type of the ingredient.
	 * @param default_ If the ingredient is a default item, this is the item's network ID and metadata.
	 * @param molang If the ingredient is a molang item, this is the molang string and version
	 * @param itemTag If the ingredient is an item tag, this is the tag.
	 * @param deferred If the ingredient is a deferred item, this is the name and metadata.
	 * @param complexAlias If the ingredient is a complex alias, this is the name
	 * @param stackSize The stack size of the ingredient
	 */
	public constructor(
		type: InternalType,
		default_: RecipeIngredientDefault | null,
		molang: RecipeIngredientMolang | null,
		itemTag: RecipeIngredientItemTag | null,
		deferred: RecipeIngredientDeferred | null,
		complexAlias: RecipeIngredientComplexAlias | null,
		stackSize: number
	) {
		super();
		this.type = type;
		this.default = default_;
		this.molang = molang;
		this.itemTag = itemTag;
		this.deferred = deferred;
		this.complexAlias = complexAlias;
		this.stackSize = stackSize;
	}

	public static read(stream: BinaryStream): RecipeIngredient {
		// Read the type
		const type = stream.readUint8();

		// Initialize the default, molang, itemTag, deferred, and complexAlias variables
		let default_: RecipeIngredientDefault | null = null;
		let molang: RecipeIngredientMolang | null = null;
		let itemTag: RecipeIngredientItemTag | null = null;
		let deferred: RecipeIngredientDeferred | null = null;
		let complexAlias: RecipeIngredientComplexAlias | null = null;

		// Switch based on the type
		switch (type) {
			default: {
				throw new Error(
					`Unknown ingredient type: ${type}, offset: ${stream.offset}`
				);
			}

			case InternalType.Invalid: {
				break;
			}

			case InternalType.Default: {
				// Read the network ID
				const networkId = stream.readInt16(Endianness.Little);

				// Read the metadata
				const metadata =
					networkId === 0 ? 0 : stream.readInt16(Endianness.Little);

				// Set the default variable
				default_ = { networkId, metadata };

				break;
			}

			case InternalType.Molang: {
				// Read the molang string
				const molang_ = stream.readVarString();

				// Read the version
				const version = stream.readUint8();

				// Set the molang variable
				molang = { molang: molang_, version };
				break;
			}

			case InternalType.ItemTag: {
				// Read the tag
				const tag = stream.readVarString();

				// Set the itemTag variable
				itemTag = { tag };
				break;
			}

			case InternalType.Deferred: {
				// Read the name
				const name = stream.readVarString();

				// Read the metadata
				const metadata = stream.readInt16(Endianness.Little);

				// Set the deferred variable
				deferred = { name, metadata };
				break;
			}

			case InternalType.ComplexAlias: {
				// Read the name
				const name = stream.readVarString();

				// Set the complexAlias variable
				complexAlias = { name };
				break;
			}
		}

		// Read the stack size
		const stackSize = stream.readZigZag();

		// Return the new RecipeIngredient instance
		return new this(
			type,
			default_,
			molang,
			itemTag,
			deferred,
			complexAlias,
			stackSize
		);
	}

	public static write(stream: BinaryStream, value: RecipeIngredient): void {
		// Write the type
		stream.writeUint8(value.type);

		// Switch based on the type
		switch (value.type) {
			default: {
				throw new Error(`Unknown ingredient type: ${value.type}`);
			}

			case InternalType.Invalid: {
				break;
			}

			case InternalType.Default: {
				// Check if the default variable is null
				const default_ = value.default as RecipeIngredientDefault;

				// Write the network ID
				stream.writeInt16(default_.networkId, Endianness.Little);

				// Write the metadata
				if (default_.networkId !== 0) {
					stream.writeInt16(default_.metadata, Endianness.Little);
				}

				break;
			}

			case InternalType.Molang: {
				// Check if the molang variable is null
				const molang = value.molang as RecipeIngredientMolang;

				// Write the molang string
				stream.writeVarString(molang.molang);

				// Write the version
				stream.writeUint8(molang.version);

				break;
			}

			case InternalType.ItemTag: {
				// Check if the itemTag variable is null
				const itemTag = value.itemTag as RecipeIngredientItemTag;

				// Write the tag
				stream.writeVarString(itemTag.tag);

				break;
			}

			case InternalType.Deferred: {
				// Check if the deferred variable is null
				const deferred = value.deferred as RecipeIngredientDeferred;

				// Write the name
				stream.writeVarString(deferred.name);

				// Write the metadata
				stream.writeInt16(deferred.metadata, Endianness.Little);

				break;
			}

			case InternalType.ComplexAlias: {
				// Check if the complexAlias variable is null
				const complexAlias = value.complexAlias as RecipeIngredientComplexAlias;

				// Write the name
				stream.writeVarString(complexAlias.name);

				break;
			}
		}

		// Write the stack size
		stream.writeZigZag(value.stackSize);
	}
}

export { RecipeIngredient };
