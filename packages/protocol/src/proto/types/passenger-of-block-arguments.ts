import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { PassengerOfBlockEmoteType } from "../../enums";

import { BlockPosition } from "./block-position";
import { Vector3f } from "./vector3f";

/**
 * Represents the state of an actor that is riding a block.
 */
class PassengerOfBlockArguments extends DataType {
  /**
   * The position of the block being ridden.
   */
  public position: BlockPosition;

  /**
   * The offset of the passenger from the block position.
   */
  public offset: Vector3f;

  /**
   * The rotation of the passenger.
   */
  public rotation: number;

  /**
   * The rotation limit of the passenger.
   */
  public rotationLimit: number;

  /**
   * The emote type of the passenger, such as standing, riding or laying.
   */
  public emoteType: PassengerOfBlockEmoteType;

  /**
   * Creates a new passenger of block arguments instance.
   * @param position The position of the block being ridden.
   * @param offset The offset of the passenger from the block position.
   * @param rotation The rotation of the passenger.
   * @param rotationLimit The rotation limit of the passenger.
   * @param emoteType The emote type of the passenger.
   */
  public constructor(
    position: BlockPosition,
    offset: Vector3f,
    rotation = 0,
    rotationLimit = 0,
    emoteType = PassengerOfBlockEmoteType.Riding
  ) {
    super();
    this.position = position;
    this.offset = offset;
    this.rotation = rotation;
    this.rotationLimit = rotationLimit;
    this.emoteType = emoteType;
  }

  public static read(stream: BinaryStream): PassengerOfBlockArguments {
    // Read the position of the block being ridden
    const position = BlockPosition.read(stream);

    // Read the offset of the passenger
    const offset = Vector3f.read(stream);

    // Read the rotation and the rotation limit of the passenger
    const rotation = stream.readFloat32(Endianness.Little);
    const rotationLimit = stream.readFloat32(Endianness.Little);

    // Read the emote type of the passenger
    const emoteType = stream.readUint8() as PassengerOfBlockEmoteType;

    // Return the new passenger of block arguments
    return new this(position, offset, rotation, rotationLimit, emoteType);
  }

  public static write(
    stream: BinaryStream,
    value: PassengerOfBlockArguments
  ): void {
    // Write the position of the block being ridden
    BlockPosition.write(stream, value.position);

    // Write the offset of the passenger
    Vector3f.write(stream, value.offset);

    // Write the rotation and the rotation limit of the passenger
    stream.writeFloat32(value.rotation, Endianness.Little);
    stream.writeFloat32(value.rotationLimit, Endianness.Little);

    // Write the emote type of the passenger
    stream.writeUint8(value.emoteType);
  }
}

export { PassengerOfBlockArguments };
