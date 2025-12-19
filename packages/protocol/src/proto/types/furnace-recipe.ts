import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { NetworkItemInstanceDescriptor } from "./network-item-instance-descriptor";

class FurnaceRecipe extends DataType {
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
   * Creates an instance of FurnaceRecipe.
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

  public static read(stream: BinaryStream): FurnaceRecipe {
    // Read the input of the recipe.
    const data = stream.readZigZag();

    // Read the result of the recipe.
    const resultant = NetworkItemInstanceDescriptor.read(stream);

    // Read the tag of the recipe.
    const tag = stream.readVarString();

    // Return the furnace recipe.
    return new FurnaceRecipe(data, resultant, tag);
  }

  public static write(stream: BinaryStream, value: FurnaceRecipe): void {
    // Write the input of the recipe.
    stream.writeZigZag(value.data);

    // Write the result of the recipe.
    NetworkItemInstanceDescriptor.write(stream, value.resultant);

    // Write the tag of the recipe.
    stream.writeVarString(value.tag);
  }
}

export { FurnaceRecipe };
