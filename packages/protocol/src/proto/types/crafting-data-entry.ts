import { DataType } from "@serenityjs/raknet";

import { CraftingDataEntryType } from "../../enums";

import { ShapelessRecipe } from "./shapeless-recipe";
import { SmithingTransformRecipe } from "./smithing-transform-recipe";
import { MultiRecipe } from "./multi-recipe";
import { FurnanceAuxRecipe } from "./furnance-aux-recipe";
import { FurnanceRecipe } from "./furnance-recipe";
import { ShapedRecipe } from "./shaped-recipe";
import { SmithingTrimRecipe } from "./smithing-trim-recipe";

import type { ShulkerBoxRecipe } from "./shulkerbox-recipe";
import type { BinaryStream } from "@serenityjs/binarystream";

class CraftingDataEntry extends DataType {
	public readonly type: CraftingDataEntryType;
	public readonly shapeless: ShapelessRecipe | null;
	public readonly shaped: ShapedRecipe | null;
	public readonly furnace: FurnanceRecipe | null;
	public readonly furnaceAux: FurnanceAuxRecipe | null;
	public readonly multi: MultiRecipe | null;
	public readonly shulkerBox: ShulkerBoxRecipe | null;
	public readonly shaplessChemistry: ShapelessRecipe | null;
	public readonly shapedChemistry: ShapedRecipe | null;
	public readonly smithingTransform: SmithingTransformRecipe | null;
	public readonly smithingTrim: SmithingTrimRecipe | null;

	public constructor(
		type: CraftingDataEntryType,
		shapeless: ShapelessRecipe | null,
		shaped: ShapedRecipe | null,
		furnace: FurnanceRecipe | null,
		furnaceAux: FurnanceAuxRecipe | null,
		multi: MultiRecipe | null,
		shulkerBox: ShulkerBoxRecipe | null,
		shaplessChemistry: ShapelessRecipe | null,
		shapedChemistry: ShapedRecipe | null,
		smithingTransform: SmithingTransformRecipe | null,
		smithingTrim: SmithingTrimRecipe | null
	) {
		super();
		this.type = type;
		this.shapeless = shapeless;
		this.shaped = shaped;
		this.furnace = furnace;
		this.furnaceAux = furnaceAux;
		this.multi = multi;
		this.shulkerBox = shulkerBox;
		this.shaplessChemistry = shaplessChemistry;
		this.shapedChemistry = shapedChemistry;
		this.smithingTransform = smithingTransform;
		this.smithingTrim = smithingTrim;
	}

	public static read(stream: BinaryStream): Array<CraftingDataEntry> {
		// Read the number of entries.
		const count = stream.readVarInt();

		// Prepare an array to store the entries.
		const entries: Array<CraftingDataEntry> = [];

		// Iterate over the entries.
		for (let index = 0; index < count; index++) {
			// Read the type of the entry.
			const type = stream.readZigZag() as CraftingDataEntryType;

			// Prepare the variables to store the recipes.
			let shapeless: ShapelessRecipe | null = null;
			let shaped: ShapedRecipe | null = null;
			let furnace: FurnanceRecipe | null = null;
			let furnaceAux: FurnanceAuxRecipe | null = null;
			let multi: MultiRecipe | null = null;
			let shulkerBox: ShulkerBoxRecipe | null = null;
			let shaplessChemistry: ShapelessRecipe | null = null;
			let shapedChemistry: ShapedRecipe | null = null;
			let smithingTransform: SmithingTransformRecipe | null = null;
			let smithingTrim: SmithingTrimRecipe | null = null;

			// Read the recipe based on the type.
			switch (type) {
				default: {
					throw new Error(
						`Unknown crafting data entry type: ${type}, index: ${index}, offset: ${stream.offset}`
					);
				}

				case CraftingDataEntryType.ShapelessRecipe: {
					shapeless = ShapelessRecipe.read(stream);
					break;
				}

				case CraftingDataEntryType.ShapedRecipe: {
					shaped = ShapedRecipe.read(stream);
					break;
				}

				case CraftingDataEntryType.FurnaceRecipe: {
					furnace = FurnanceRecipe.read(stream);
					break;
				}

				case CraftingDataEntryType.FurnaceAuxRecipe: {
					furnaceAux = FurnanceAuxRecipe.read(stream);
					break;
				}

				case CraftingDataEntryType.MultiRecipe: {
					multi = MultiRecipe.read(stream);
					break;
				}

				case CraftingDataEntryType.ShulkerBoxRecipe: {
					shulkerBox = ShapelessRecipe.read(stream);
					break;
				}

				case CraftingDataEntryType.ShapelessChemistryRecipe: {
					shaplessChemistry = ShapelessRecipe.read(stream);
					break;
				}

				case CraftingDataEntryType.ShapedChemistryRecipe: {
					shapedChemistry = ShapedRecipe.read(stream);
					break;
				}

				case CraftingDataEntryType.SmithingTransformRecipe: {
					smithingTransform = SmithingTransformRecipe.read(stream);
					break;
				}

				case CraftingDataEntryType.SmithingTrimRecipe: {
					smithingTrim = SmithingTrimRecipe.read(stream);
					break;
				}
			}

			// Create the crafting data entry.
			const entry = new this(
				type,
				shapeless,
				shaped,
				furnace,
				furnaceAux,
				multi,
				shulkerBox,
				shaplessChemistry,
				shapedChemistry,
				smithingTransform,
				smithingTrim
			);

			// Push the entry to the entries array.
			entries.push(entry);
		}

		// Return the entries.
		return entries;
	}

	public static write(
		stream: BinaryStream,
		entries: Array<CraftingDataEntry>
	): void {
		// Write the number of entries.
		stream.writeVarInt(entries.length);

		// Iterate over the entries.
		for (const entry of entries) {
			// Write the type of the entry.
			stream.writeZigZag(entry.type);

			// Write the recipe based on the type.
			switch (entry.type) {
				default: {
					throw new Error(`Unknown crafting data entry type: ${entry.type}`);
				}

				case CraftingDataEntryType.ShapelessRecipe: {
					ShapelessRecipe.write(stream, entry.shapeless as ShapelessRecipe);
					break;
				}

				case CraftingDataEntryType.ShapedRecipe: {
					ShapedRecipe.write(stream, entry.shaped as ShapedRecipe);
					break;
				}

				case CraftingDataEntryType.FurnaceRecipe: {
					FurnanceRecipe.write(stream, entry.furnace as FurnanceRecipe);
					break;
				}

				case CraftingDataEntryType.FurnaceAuxRecipe: {
					FurnanceAuxRecipe.write(
						stream,
						entry.furnaceAux as FurnanceAuxRecipe
					);
					break;
				}

				case CraftingDataEntryType.MultiRecipe: {
					MultiRecipe.write(stream, entry.multi as MultiRecipe);
					break;
				}

				case CraftingDataEntryType.ShulkerBoxRecipe: {
					ShapelessRecipe.write(stream, entry.shulkerBox as ShapelessRecipe);
					break;
				}

				case CraftingDataEntryType.ShapelessChemistryRecipe: {
					ShapelessRecipe.write(
						stream,
						entry.shaplessChemistry as ShapelessRecipe
					);
					break;
				}

				case CraftingDataEntryType.ShapedChemistryRecipe: {
					ShapedRecipe.write(stream, entry.shapedChemistry as ShapedRecipe);
					break;
				}

				case CraftingDataEntryType.SmithingTransformRecipe: {
					SmithingTransformRecipe.write(
						stream,
						entry.smithingTransform as SmithingTransformRecipe
					);
					break;
				}

				case CraftingDataEntryType.SmithingTrimRecipe: {
					SmithingTrimRecipe.write(
						stream,
						entry.smithingTrim as SmithingTrimRecipe
					);
					break;
				}
			}
		}
	}
}

export { CraftingDataEntry };
