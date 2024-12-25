import { Endianness, type BinaryStream } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import { UnlockedRecipesType } from "../../types";

class UnlockedRecipesEntry extends DataType {
  public type: UnlockedRecipesType;
  public recipes: Array<string> = [];

  public constructor(type: UnlockedRecipesType, recipes: Array<string>) {
    super();
    this.type = type;
    this.recipes = recipes;
  }

  public static write(stream: BinaryStream, value: UnlockedRecipesEntry): void {
    stream.writeInt32(value.type, Endianness.Little);
    stream.writeVarInt(value.recipes.length);
    for (const recipe of value.recipes) {
      stream.writeVarString(recipe);
    }
  }

  public static read(stream: BinaryStream): UnlockedRecipesEntry {
    const recipes = [];
    const type = stream.readInt32(Endianness.Little);
    const recipeCount = stream.readVarInt();

    for (let i = 0; i < recipeCount; i++) {
      recipes.push(stream.readVarString());
    }

    return new UnlockedRecipesEntry(type, recipes);
  }
}

export { UnlockedRecipesEntry };
