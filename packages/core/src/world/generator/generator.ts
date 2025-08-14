import { Chunk } from "../chunk";
import { TerrainGeneratorProperties } from "../../types";
import { Dimension } from "../dimension";

const DefaultTerrainGeneratorProperties: TerrainGeneratorProperties = {
  seed: Math.floor(Math.random() * 0x7fffffff)
};

class TerrainGenerator {
  /**
   * The identifier of the generator.
   */
  public static readonly identifier: string;

  /**
   * The identifier of the generator.
   */
  public readonly identifier = (this.constructor as typeof TerrainGenerator)
    .identifier;

  /**
   * The dimension of the generator.
   */
  public readonly dimension: Dimension;

  /**
   * The properties of the generator.
   */
  public readonly properties: TerrainGeneratorProperties =
    DefaultTerrainGeneratorProperties;

  public readonly path = __filename;

  /**
   * Creates a new terrain generator with the specified properties.
   * @param properties The properties to use for the generator.
   */
  public constructor(
    dimension: Dimension,
    properties?: Partial<TerrainGeneratorProperties>
  ) {
    // Set the dimension & world of the generator.
    this.dimension = dimension;

    // Set the properties of the generator.
    this.properties = { ...DefaultTerrainGeneratorProperties, ...properties };
  }

  /**
   * Generates a chunk at the specified coordinates.
   * @param cx The chunk x coordinate.
   * @param cz The chunk z coordinate.
   */
  public async apply(_cx: number, _cz: number): Promise<Chunk> {
    throw new Error(`${this.identifier}.apply() is not implemented`);
  }

  /**
   * Generates structures at a given chunk.
   * @param chunk The chunk to apply structures to.
   */
  public async applyStructures?(_chunk: Chunk): Promise<void>;
}

export { TerrainGenerator };
