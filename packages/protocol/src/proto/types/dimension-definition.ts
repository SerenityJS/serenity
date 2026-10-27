import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { DimensionType, GeneratorType } from "../../enums";

import { Uuid } from "./uuid";

/**
 * Represents a custom dimension definition, keyed by its identifier.
 */
class DimensionDefinition extends DataType {
  /**
   * The identifier of the dimension.
   */
  public identifier: string;

  /**
   * The minimum y level of the dimension.
   */
  public minimumY: number;

  /**
   * The height range of the dimension.
   */
  public heightRange: number;

  /**
   * The generator type of the dimension.
   */
  public generatorType: GeneratorType;

  /**
   * The dimension type the dimension is based on.
   */
  public dimensionType: DimensionType;

  /**
   * The uuid of the pack that registered the dimension.
   */
  public packId: string;

  /**
   * The identifier of the biome the dimension generates with.
   */
  public defaultBiome: string;

  /**
   * The height at which clouds render in the dimension.
   */
  public cloudHeight: number;

  /**
   * Whether clouds render in the dimension.
   */
  public renderClouds: boolean;

  /**
   * Creates a new dimension definition.
   * @param identifier The identifier of the dimension.
   * @param minimumY The minimum y level of the dimension.
   * @param heightRange The height range of the dimension.
   * @param generatorType The generator type of the dimension.
   * @param dimensionType The dimension type the dimension is based on.
   * @param packId The uuid of the pack that registered the dimension.
   * @param defaultBiome The identifier of the biome the dimension generates with.
   * @param cloudHeight The height at which clouds render in the dimension.
   * @param renderClouds Whether clouds render in the dimension.
   */
  public constructor(
    identifier: string,
    minimumY: number,
    heightRange: number,
    generatorType: GeneratorType,
    dimensionType: DimensionType = DimensionType.Overworld,
    packId = "00000000-0000-0000-0000-000000000000",
    defaultBiome = "",
    cloudHeight = 192,
    renderClouds = true
  ) {
    super();
    this.identifier = identifier;
    this.minimumY = minimumY;
    this.heightRange = heightRange;
    this.generatorType = generatorType;
    this.dimensionType = dimensionType;
    this.packId = packId;
    this.defaultBiome = defaultBiome;
    this.cloudHeight = cloudHeight;
    this.renderClouds = renderClouds;
  }

  public static write(stream: BinaryStream, value: DimensionDefinition): void {
    stream.writeVarString(value.identifier);
    stream.writeZigZag(value.minimumY);
    stream.writeZigZag(value.heightRange);
    stream.writeZigZag(value.generatorType);
    stream.writeZigZag(value.dimensionType);
    Uuid.write(stream, value.packId);
    stream.writeVarString(value.defaultBiome);
    stream.writeZigZag(value.cloudHeight);
    stream.writeBool(value.renderClouds);
  }

  public static read(stream: BinaryStream): DimensionDefinition {
    return new DimensionDefinition(
      stream.readVarString(), // ? Identifier
      stream.readZigZag(), // ? Minimum Y
      stream.readZigZag(), // ? Height Range
      stream.readZigZag(), // ? Generator Type
      stream.readZigZag(), // ? Dimension Type
      Uuid.read(stream), // ? Pack Id
      stream.readVarString(), // ? Default Biome
      stream.readZigZag(), // ? Cloud Height
      stream.readBool() // ? Render Clouds
    );
  }
}

export { DimensionDefinition };
