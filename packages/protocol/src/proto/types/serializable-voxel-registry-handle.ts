import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

class SerializableVoxelRegistryHandle extends DataType {
  /**
   * The name of the voxel shape.
   */
  public name: string;

  /**
   * The numeric index of the voxel shape.
   */
  public index: number;

  /**
   * Creates a new instance of SerializableVoxelRegistryHandle.
   * @param name The name of the voxel shape.
   * @param index The numeric index of the voxel shape.
   */
  public constructor(name: string, index: number) {
    super();

    // Assign properties
    this.name = name;
    this.index = index;
  }

  public static read(stream: BinaryStream): SerializableVoxelRegistryHandle {
    // Read properties
    const name = stream.readVarString();
    const index = stream.readUint16(Endianness.Little);

    // Return the instance
    return new this(name, index);
  }

  public static write(
    stream: BinaryStream,
    instance: SerializableVoxelRegistryHandle
  ): void {
    // Write properties
    stream.writeVarString(instance.name);
    stream.writeUint16(instance.index, Endianness.Little);
  }
}

export { SerializableVoxelRegistryHandle };
