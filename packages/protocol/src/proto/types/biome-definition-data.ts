import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { Color } from "./color";

class BiomeDefinitionData extends DataType {
  /**
   * The identifier of the biome (optional, may be -1 if not set).
   */
  public identifier: number;

  /**
   * The temperature of the biome, determines the color of grass and foliage.
   */
  public temperature: number;

  /**
   * The amount of precipitation affects color of grass and foliage.
   */
  public downfall: number;

  /**
   * The density of red spores visuals in the biome.
   */
  public redSporeDensity: number;

  /**
   * The density of blue spores visuals in the biome.
   */
  public blueSporeDensity: number;

  /**
   * The density of ash visuals in the biome.
   */
  public ashDensity: number;

  /**
   * The density of white ash visuals in the biome.
   */
  public whiteAshDensity: number;

  /**
   * The depth of the biome, affects terrain generation.
   */
  public depth: number;

  /**
   * The scale of the biome, affects terrain generation.
   */
  public scale: number;

  /**
   * The color of the water in the biome (ARGB format).
   */
  public waterColor: Color;

  /**
   * Whether the biome can experience rain.
   */
  public canRain: boolean;

  /**
   * The indices of the tags associated with the biome.
   */
  public tagIndices: Array<number>;

  /**
   * Whether the biome has client sided chunk generation.
   */
  public hasClientSidedChunkGeneration: boolean;

  /**
   * Creates a new BiomeDefinitionData instance.
   * @param identifier The identifier of the biome (optional, may be -1 if not set).
   * @param temperature The temperature of the biome, determines the color of grass and foliage.
   * @param downfall The amount of precipitation affects color of grass and foliage
   * @param redSporeDensity The density of red spores visuals in the biome.
   * @param blueSporeDensity The density of blue spores visuals in the biome.
   * @param ashDensity The density of ash visuals in the biome.
   * @param whiteAshDensity The density of white ash visuals in the biome.
   * @param depth The depth of the biome, affects terrain generation.
   * @param scale The scale of the biome, affects terrain generation.
   * @param waterColor The color of the water in the biome (ARGB format).
   * @param canRain Whether the biome can experience rain.
   * @param tagIndices The indices of the tags associated with the biome.
   * @param hasClientSidedChunkGeneration Whether the biome has client sided chunk generation.
   */
  public constructor(
    // identifierIndex: number,
    identifier: number,
    temperature: number,
    downfall: number,
    redSporeDensity: number,
    blueSporeDensity: number,
    ashDensity: number,
    whiteAshDensity: number,
    depth: number,
    scale: number,
    waterColor: Color,
    canRain: boolean,
    tagIndices: Array<number>,
    hasClientSidedChunkGeneration: boolean
  ) {
    super();

    // Assign the parameters to the class properties
    this.identifier = identifier;
    this.temperature = temperature;
    this.downfall = downfall;
    this.redSporeDensity = redSporeDensity;
    this.blueSporeDensity = blueSporeDensity;
    this.ashDensity = ashDensity;
    this.whiteAshDensity = whiteAshDensity;
    this.depth = depth;
    this.scale = scale;
    this.waterColor = waterColor;
    this.canRain = canRain;
    this.tagIndices = tagIndices;
    this.hasClientSidedChunkGeneration = hasClientSidedChunkGeneration;
  }

  public static read(stream: BinaryStream): BiomeDefinitionData {
    // Read the the biome data from the stream
    const identifier = stream.readUint16(Endianness.Little);
    const temperature = stream.readFloat32(Endianness.Little);
    const downfall = stream.readFloat32(Endianness.Little);
    const redSporeDensity = stream.readFloat32(Endianness.Little);
    const blueSporeDensity = stream.readFloat32(Endianness.Little);
    const ashDensity = stream.readFloat32(Endianness.Little);
    const whiteAshDensity = stream.readFloat32(Endianness.Little);
    const depth = stream.readFloat32(Endianness.Little);
    const scale = stream.readFloat32(Endianness.Little);
    const waterColor = Color.read(stream);
    const canRain = stream.readBool();

    // Prepare the tag indices array
    const tagIndices: Array<number> = [];

    // Check if the biome has tags
    if (stream.readBool()) {
      // Read the number of tags
      const tagCount = stream.readVarInt();

      // Read each tag index
      for (let i = 0; i < tagCount; i++) {
        tagIndices.push(stream.readUint16(Endianness.Little));
      }
    }

    // Has client sided chunk generation
    const hasClientSidedChunkGeneration = stream.readBool();

    // Return a new BiomeDefinitionData instance with the read values
    return new this(
      // identifierIndex,
      identifier,
      temperature,
      downfall,
      redSporeDensity,
      blueSporeDensity,
      ashDensity,
      whiteAshDensity,
      depth,
      scale,
      waterColor,
      canRain,
      tagIndices,
      hasClientSidedChunkGeneration
    );
  }

  public static write(stream: BinaryStream, value: BiomeDefinitionData): void {
    // Write the rest of the biome properties
    stream.writeUint16(value.identifier, Endianness.Little);
    stream.writeFloat32(value.temperature, Endianness.Little);
    stream.writeFloat32(value.downfall, Endianness.Little);
    stream.writeFloat32(value.redSporeDensity, Endianness.Little);
    stream.writeFloat32(value.blueSporeDensity, Endianness.Little);
    stream.writeFloat32(value.ashDensity, Endianness.Little);
    stream.writeFloat32(value.whiteAshDensity, Endianness.Little);
    stream.writeFloat32(value.depth, Endianness.Little);
    stream.writeFloat32(value.scale, Endianness.Little);
    Color.write(stream, value.waterColor);
    stream.writeBool(value.canRain);

    // Check if the biome has tags
    if (value.tagIndices.length > 0) {
      // Write that the biome has tags
      stream.writeBool(true);

      // Write the number of tags
      stream.writeVarInt(value.tagIndices.length);

      // Write each tag index
      for (const tagIndex of value.tagIndices) {
        stream.writeUint16(tagIndex, Endianness.Little);
      }
    } else {
      // Write that the biome has no tags
      stream.writeBool(false);
    }

    // Has client sided chunk generation
    stream.writeBool(value.hasClientSidedChunkGeneration);
  }
}

export { BiomeDefinitionData };
