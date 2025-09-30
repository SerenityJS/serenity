import { BIOME_TYPES } from "@serenityjs/data";
import { Color } from "@serenityjs/protocol";

import { CustomBiomeType } from "./custom";

class BiomeType {
  /**
   * A collective registry of all biome types.
   */
  public static readonly types = new Map<number, BiomeType>();

  static {
    // Iterate through each biome definition and register it.
    for (const definition of BIOME_TYPES) {
      // Create a new biome type.
      const type = new this(
        definition.identifier,
        definition.networkId,
        definition.tags
      );

      // Assign the biome properties.
      type.temperature = definition.temperature;
      type.downfall = definition.downfall;
      type.snowFoilage = definition.snowFoilage;
      type.depth = definition.depth;
      type.scale = definition.scale;
      type.waterColor = Color.fromInt(definition.waterColor);
      type.canPrecipitate = definition.canPrecipitate;

      // Register the biome type.
      BiomeType.types.set(type.networkId, type);
    }
  }

  /**
   * The identifier of the biome type. (e.g., "minecraft:plains")
   */
  public readonly identifier: string;

  /**
   * The network ID of the biome type.
   */
  public readonly networkId: number;

  /**
   * The tags associated with the biome type.
   */
  private readonly tags = new Set<string>();

  /**
   * The temperature of the biome type. [0.0 - 1.0]
   */
  public temperature: number = 0;

  /**
   * The amount of precipitation in the biome type. [0.0 - 1.0]
   * If the biome temperature is below 0.15, it will snow instead of rain.
   */
  public downfall: number = 0.4;

  /**
   * How frozen leaves appear in the biome. [0.0 - 1.0]
   */
  public snowFoilage: number = 0;

  /**
   * The depth of the biome type, affects terrain generation.
   */
  public depth: number = 0;

  /**
   * The scale of the biome type, affects terrain generation.
   */
  public scale: number = 0;

  /**
   * The color of the water in the biome type (ARGB format).
   */
  public waterColor: Color = new Color(0, 0, 0, 255);

  /**
   * Whether the biome type can experience rain or snow.
   */
  public canPrecipitate: boolean = true;

  /**
   * Create a new biome type.
   * @param identifier The identifier of the biome type.
   * @param networkId The network ID of the biome type.
   * @param tags The optional tags associated with the biome type.
   */
  public constructor(
    identifier: string,
    networkId: number,
    tags?: Array<string>
  ) {
    // Assign the identifier and tags
    this.identifier = identifier;
    this.networkId = networkId;
    this.tags = new Set(tags ?? []);
  }

  /**
   * Whether this biome type is a custom biome type.
   * @returns True if this biome type is a custom biome type, false otherwise.
   */
  public isCustom(): this is CustomBiomeType {
    return false;
  }

  /**
   * Get all tags associated with the biome type.
   * @returns An array of all tags associated with the biome type.
   */
  public getAllTags(): Array<string> {
    return Array.from(this.tags.values());
  }

  /**
   * Check if the biome type has a specific tag.
   * @param tag The tag to check for.
   * @returns True if the biome type has the tag, false otherwise.
   */
  public hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  /**
   * Add a tag to the biome type.
   * @param tag The tag to add.
   */
  public addTag(...tag: Array<string>): void {
    // Iterate through each tag and add it to the set
    for (const t of tag) this.tags.add(t);
  }

  /**
   * Remove a tag from the biome type.
   * @param tag The tag to remove.
   */
  public removeTag(...tag: Array<string>): void {
    // Iterate through each tag and remove it from the set
    for (const t of tag) this.tags.delete(t);
  }
}

export { BiomeType };
