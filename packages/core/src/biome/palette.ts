import {
  BiomeDefinitionList,
  BiomeDefinitionListPacket
} from "@serenityjs/protocol";

import { BiomeType } from "./identity";

class BiomePalette {
  /**
   * The types of biomes registered in the palette.
   */
  private readonly types = BiomeType.types;

  /**
   * A cached biome definition list packet. This is used to avoid recreating the packet every time it is requested.
   */
  private packetCache: BiomeDefinitionListPacket | null = null;

  /**
   * Gets all biome types from the palette.
   * @returns All biome types from the palette.
   */
  public getAllTypes(): Array<BiomeType> {
    return [...this.types.values()];
  }

  /**
   * Get a biome type from the palette by its identifier.
   * @param identifier The identifier of the biome type.
   * @returns The biome type from the palette, or null if not found.
   */
  public getType(identifier: string): BiomeType | null {
    // Iterate through each type in the map.
    for (const [, type] of this.types) {
      // Check if the identifier matches.
      if (type.identifier === identifier) return type;
    }

    // The biome type was not found.
    return null;
  }

  /**
   * Register one or more biome types in the palette.
   * @param types The biome types to register.
   * @returns This instance for chaining.
   */
  public registerType(...types: Array<BiomeType>): this {
    // Iterate through each type.
    for (const type of types) {
      // Check if the biome type is already registered.
      if (this.types.has(type.networkId)) continue;

      // Register the biome type.
      this.types.set(type.networkId, type);
    }

    // Reset the packet cache.
    this.packetCache = null;

    // Return this instance.
    return this;
  }

  /**
   * Unregister one or more biome types from the palette.
   * @param types The biome types to unregister.
   * @returns This instance for chaining.
   */
  public unregisterType(...types: Array<BiomeType>): this {
    // Iterate through each type.
    for (const type of types) {
      // Check if the biome type is not registered.
      if (!this.types.has(type.networkId)) continue;

      // Unregister the biome type.
      this.types.delete(type.networkId);
    }

    // Reset the packet cache.
    this.packetCache = null;

    // Return this instance.
    return this;
  }

  /**
   * Get a biome definition list packet containing all biome definitions in the palette.
   * @returns A biome definition list packet.
   */
  public getBiomeDefinitionList(): BiomeDefinitionListPacket {
    // Check if we have a cached packet.
    if (this.packetCache) return this.packetCache;

    // Create a new biome definition list packet.
    const packet = new BiomeDefinitionListPacket();

    // Assign the identifiers and definitions.
    packet.identifiers = [];
    packet.definitions = [];

    // Populate the identifiers and definitions.
    for (const [, type] of this.types) {
      // Check if the identifier is already in the list.
      let identifierIndex = packet.identifiers.indexOf(type.identifier);

      // If the identifier is not already in the list, add it.
      if (identifierIndex === -1) {
        // Push the identifier and get the new index.
        const size = packet.identifiers.push(type.identifier);

        // Update the index.
        identifierIndex = size - 1;
      }

      // Create a new biome definition list entry.
      const definition = new BiomeDefinitionList(identifierIndex, {
        identifier: type.isCustom() ? type.networkId : 65535,
        temperature: type.temperature,
        downfall: type.downfall,
        snowFoilage: type.snowFoilage,
        depth: type.depth,
        scale: type.scale,
        waterColor: type.waterColor,
        canRain: type.canPrecipitate,
        tagIndices: [...type.getAllTags()].map((tag) => {
          // Check if the tag is already in the list.
          let tagIndex = packet.identifiers.indexOf(tag);

          // If the tag is not already in the list, add it.
          if (tagIndex === -1) {
            // Push the tag and get the new index.
            const size = packet.identifiers.push(tag);

            // Update the index.
            tagIndex = size - 1;
          }

          // Return the tag index.
          return tagIndex;
        }),
        hasClientSidedChunkGeneration: false // Should always be false since we don't support client-sided chunk generation
      });

      // Push the definition to the packet.
      packet.definitions.push(definition);
    }

    // Cache the packet.
    this.packetCache = packet;

    // Return the packet with all biome definitions.
    return packet;
  }
}

export { BiomePalette };
