import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

class AttributeLayerSettings extends DataType {
  public priority: number;
  public floatWeight: number;
  public enabled: boolean;
  public transitionsPaused: boolean;

  public constructor(
    priority: number,
    floatWeight: number,
    enabled: boolean,
    transitionsPaused: boolean
  ) {
    super();
    this.priority = priority;
    this.floatWeight = floatWeight;
    this.enabled = enabled;
    this.transitionsPaused = transitionsPaused;
  }

  public static read(stream: BinaryStream): AttributeLayerSettings {
    return new this(
      stream.readInt32(Endianness.Little),
      stream.readFloat32(Endianness.Little),
      stream.readBool(),
      stream.readBool()
    );
  }

  public static write(stream: BinaryStream, value: AttributeLayerSettings): void {
    stream.writeInt32(value.priority, Endianness.Little);
    stream.writeFloat32(value.floatWeight, Endianness.Little);
    stream.writeBool(value.enabled);
    stream.writeBool(value.transitionsPaused);
  }
}

export { AttributeLayerSettings };
