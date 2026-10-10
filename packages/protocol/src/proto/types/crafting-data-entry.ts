import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { CraftingDataEntryType } from "../../enums";

import { MultiRecipe } from "./multi-recipe";
import { ShapedRecipe } from "./shaped-recipe";
import { ShapelessRecipe } from "./shapeless-recipe";
import { SmithingTransformRecipe } from "./smithing-transform-recipe";
import { SmithingTrimRecipe } from "./smithing-trim-recipe";
import { UserDataShapelessRecipe } from "./user-data-shapeless-recipe";

type CraftingDataEntryRecipe =
  | ShapelessRecipe
  | ShapedRecipe
  | MultiRecipe
  | UserDataShapelessRecipe
  | ShapelessRecipe
  | SmithingTransformRecipe
  | SmithingTrimRecipe;

interface CraftingDataEntryCodec {
  read(stream: BinaryStream): CraftingDataEntryRecipe;
  write(stream: BinaryStream, value: never): void;
}

/**
 * Since v2168, recipes are written as a separate list per recipe type, in this order.
 */
const CraftingDataEntryLists: Array<
  [CraftingDataEntryType, CraftingDataEntryCodec]
> = [
  [CraftingDataEntryType.ShapedRecipe, ShapedRecipe],
  [CraftingDataEntryType.ShapelessRecipe, ShapelessRecipe],
  [CraftingDataEntryType.MultiRecipe, MultiRecipe],
  [CraftingDataEntryType.UserDataShapelessRecipe, ShapelessRecipe],
  [CraftingDataEntryType.ShapelessChemistryRecipe, ShapelessRecipe],
  [CraftingDataEntryType.ShapedChemistryRecipe, ShapedRecipe],
  [CraftingDataEntryType.SmithingTransformRecipe, SmithingTransformRecipe],
  [CraftingDataEntryType.SmithingTrimRecipe, SmithingTrimRecipe]
];

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
    // Prepare an array to store the entries.
    const entries: Array<CraftingDataEntry> = [];

    // Iterate over the recipe lists in their wire order.
    for (const [type, codec] of CraftingDataEntryLists) {
      // Read the number of recipes in the list.
      const count = stream.readVarInt();

      // Read each recipe in the list, and create an entry for it.
      for (let index = 0; index < count; index++)
        entries.push(new this(type, codec.read(stream)));
    }

    // Return the entries.
    return entries;
  }

  public static write(
    stream: BinaryStream,
    entries: Array<CraftingDataEntry>
  ): void {
    // Check that every entry has a type that can be written.
    for (const entry of entries) {
      if (!CraftingDataEntryLists.some(([type]) => type === entry.type))
        throw new Error(`Unknown crafting data entry type: ${entry.type}`);
    }

    // Iterate over the recipe lists in their wire order.
    for (const [type, codec] of CraftingDataEntryLists) {
      // Get the entries that belong in the list.
      const list = entries.filter((entry) => entry.type === type);

      // Write the number of recipes in the list.
      stream.writeVarInt(list.length);

      // Write each recipe in the list.
      for (const entry of list) codec.write(stream, entry.recipe as never);
    }
  }
}

export { CraftingDataEntry };
