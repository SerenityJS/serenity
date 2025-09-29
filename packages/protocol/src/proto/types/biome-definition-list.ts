import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { BiomeDefinitionData } from "./biome-definition-data";

class BiomeDefinitionList extends DataType {
  /**
   * The identifier index of the biome.
   */
  public identifierIndex: number;

  /**
   * The biome definition data.
   */
  public definition: BiomeDefinitionData;

  /**
   * Creates a new BiomeDefinitionList instance.
   * @param identifierIndex The index of the biome identifier.
   * @param definition The biome definition data.
   */
  public constructor(identifierIndex: number, definition: BiomeDefinitionData) {
    super();

    // Assign the identifier index and definition
    this.identifierIndex = identifierIndex;
    this.definition = definition;
  }

  public static read(stream: BinaryStream): Array<BiomeDefinitionList> {
    // Read the number of biome definitions
    const amount = stream.readVarInt();

    // Prepare an array to hold the biome definitions
    const definitions: Array<BiomeDefinitionList> = [];

    // Read each biome definition
    for (let i = 0; i < amount; i++) {
      // Read the identifier index and biome definition
      const identifierIndex = stream.readUint16(Endianness.Little);

      // Read the biome definition using the BiomeDefinitionData class
      const definition = BiomeDefinitionData.read(stream);

      // Add the new BiomeDefinitionList to the array
      definitions.push(new this(identifierIndex, definition));
    }

    // Return the array of biome definitions
    return definitions;
  }

  public static write(
    stream: BinaryStream,
    value: Array<BiomeDefinitionList>
  ): void {
    // Write the number of biome definitions
    stream.writeVarInt(value.length);

    // Write each biome definition
    for (const biomeDefinition of value) {
      // Write the identifier index
      stream.writeInt16(biomeDefinition.identifierIndex, Endianness.Little);

      // Write the biome definition using the BiomeDefinition class
      BiomeDefinitionData.write(stream, biomeDefinition.definition);
    }
  }
}

export { BiomeDefinitionList };
