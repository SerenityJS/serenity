import { BinaryStream, Endianness, DataType } from "@serenityjs/binarystream";

import { SkinImage } from "./skin-image";

/**
 * Represents an animation of a skin.
 */
class SkinAnimation extends DataType {
  /**
   * The image of the animation.
   */
  public readonly image: SkinImage;

  /**
   * The type of the animation.
   */
  public readonly type: number;

  /**
   * The amount of frames of the animation.
   */
  public readonly frames: number;

  /**
   * The type of the expression of the animation.
   */
  public readonly expression: number;

  /**
   * Creates a new skin animation.
   *
   * @param image The image of the animation.
   * @param type The type of the animation.
   * @param frames The amount of frames of the animation.
   * @param expression The type of the expression of the animation.
   */
  public constructor(
    image: SkinImage,
    type: number,
    frames: number,
    expression: number
  ) {
    super();
    this.image = image;
    this.type = type;
    this.frames = frames;
    this.expression = expression;
  }

  public static read(stream: BinaryStream): SkinAnimation {
    // Read the image, type, frames and expression of the animation.
    const image = SkinImage.read(stream);
    const type = stream.readVarInt();
    const frames = stream.readFloat32(Endianness.Little);
    const expression = stream.readVarInt();

    // Return the new skin animation.
    return new SkinAnimation(image, type, frames, expression);
  }

  public static write(stream: BinaryStream, animation: SkinAnimation): void {
    // Write the image, type, frames and expression of the animation.
    SkinImage.write(stream, animation.image);
    stream.writeVarInt(animation.type);
    stream.writeFloat32(animation.frames, Endianness.Little);
    stream.writeVarInt(animation.expression);
  }
}

export { SkinAnimation };
