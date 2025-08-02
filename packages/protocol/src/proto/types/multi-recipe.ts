import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { Uuid } from "./uuid";

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
    const uuid = Uuid.read(stream);

    // Read the network id of the recipe.
    const networkId = stream.readVarInt();

    // Return the multi recipe.
    return new this(uuid, networkId);
  }

  public static write(stream: BinaryStream, value: MultiRecipe): void {
    // Write the uuid of the recipe.
    Uuid.write(stream, value.uuid);

    // Write the network id of the recipe.
    stream.writeVarInt(value.networkId);
  }
}

export { MultiRecipe };
