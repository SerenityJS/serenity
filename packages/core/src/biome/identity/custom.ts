import { BiomeType } from "./type";

class CustomBiomeType extends BiomeType {
  /**
   * The next available network ID for custom biomes.
   */
  private static nextNetworkId = 65535;

  /**
   * Create a new custom biome type.
   * @param identifier The identifier of the custom biome type.
   * @param tags The optional tags associated with the custom biome type.
   */
  public constructor(identifier: string, tags?: Array<string>) {
    super(identifier, --CustomBiomeType.nextNetworkId, tags);
  }

  public isCustom(): this is CustomBiomeType {
    return true;
  }
}

export { CustomBiomeType };
