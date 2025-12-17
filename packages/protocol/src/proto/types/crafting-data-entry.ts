import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { CraftingDataEntryType } from "../../enums";

import { FurnaceAuxRecipe } from "./furnace-aux-recipe";
import { FurnaceRecipe } from "./furnace-recipe";
import { MultiRecipe } from "./multi-recipe";
import { ShapedRecipe } from "./shaped-recipe";
import { ShapelessRecipe } from "./shapeless-recipe";
import { SmithingTransformRecipe } from "./smithing-transform-recipe";
import { SmithingTrimRecipe } from "./smithing-trim-recipe";
import { UserDataShapelessRecipe } from "./user-data-shapeless-recipe";

type CraftingDataEntryRecipe =
  | ShapelessRecipe
  | ShapedRecipe
  | FurnaceRecipe
  | FurnaceAuxRecipe
  | MultiRecipe
  | UserDataShapelessRecipe
  | ShapelessRecipe
  | SmithingTransformRecipe
  | SmithingTrimRecipe;

class CraftingDataEntry extends DataType {
  public readonly type: CraftingDataEntryType;
  public readonly recipe: CraftingDataEntryRecipe;

  public constructor(
    type: CraftingDataEntryType,
    recipe: CraftingDataEntryRecipe
  ) {
    super();
    this.type = type;
    this.recipe = recipe;
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

      // Prepare the variables to store the recipe.
      let recipe: CraftingDataEntryRecipe;

      // Read the recipe based on the type.
      switch (type) {
        default: {
          throw new Error(
            `Unknown crafting data entry type: ${type}, index: ${index}, offset: ${stream.offset}`
          );
        }

        case CraftingDataEntryType.ShapelessRecipe: {
          recipe = ShapelessRecipe.read(stream);
          break;
        }

        case CraftingDataEntryType.ShapedRecipe: {
          recipe = ShapedRecipe.read(stream);
          break;
        }

        case CraftingDataEntryType.FurnaceRecipe: {
          recipe = FurnaceRecipe.read(stream);
          break;
        }

        case CraftingDataEntryType.FurnaceAuxRecipe: {
          recipe = FurnaceAuxRecipe.read(stream);
          break;
        }

        case CraftingDataEntryType.MultiRecipe: {
          recipe = MultiRecipe.read(stream);
          break;
        }

        case CraftingDataEntryType.UserDataShapelessRecipe: {
          recipe = ShapelessRecipe.read(stream);
          break;
        }

        case CraftingDataEntryType.ShapelessChemistryRecipe: {
          recipe = ShapelessRecipe.read(stream);
          break;
        }

        case CraftingDataEntryType.ShapedChemistryRecipe: {
          recipe = ShapedRecipe.read(stream);
          break;
        }

        case CraftingDataEntryType.SmithingTransformRecipe: {
          recipe = SmithingTransformRecipe.read(stream);
          break;
        }

        case CraftingDataEntryType.SmithingTrimRecipe: {
          recipe = SmithingTrimRecipe.read(stream);
          break;
        }
      }

      // Create the crafting data entry.
      const entry = new this(type, recipe);

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
          ShapelessRecipe.write(stream, entry.recipe as ShapelessRecipe);
          break;
        }

        case CraftingDataEntryType.ShapedRecipe: {
          ShapedRecipe.write(stream, entry.recipe as ShapedRecipe);
          break;
        }

        case CraftingDataEntryType.FurnaceRecipe: {
          FurnaceRecipe.write(stream, entry.recipe as FurnaceRecipe);
          break;
        }

        case CraftingDataEntryType.FurnaceAuxRecipe: {
          FurnaceAuxRecipe.write(stream, entry.recipe as FurnaceAuxRecipe);
          break;
        }

        case CraftingDataEntryType.MultiRecipe: {
          MultiRecipe.write(stream, entry.recipe as MultiRecipe);
          break;
        }

        case CraftingDataEntryType.UserDataShapelessRecipe: {
          ShapelessRecipe.write(stream, entry.recipe as ShapelessRecipe);
          break;
        }

        case CraftingDataEntryType.ShapelessChemistryRecipe: {
          ShapelessRecipe.write(stream, entry.recipe as ShapelessRecipe);
          break;
        }

        case CraftingDataEntryType.ShapedChemistryRecipe: {
          ShapedRecipe.write(stream, entry.recipe as ShapedRecipe);
          break;
        }

        case CraftingDataEntryType.SmithingTransformRecipe: {
          SmithingTransformRecipe.write(
            stream,
            entry.recipe as SmithingTransformRecipe
          );
          break;
        }

        case CraftingDataEntryType.SmithingTrimRecipe: {
          SmithingTrimRecipe.write(stream, entry.recipe as SmithingTrimRecipe);
          break;
        }
      }
    }
  }
}

export { CraftingDataEntry };
