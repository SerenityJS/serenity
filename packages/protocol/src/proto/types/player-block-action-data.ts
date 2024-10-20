import { DataType } from "@serenityjs/raknet";

import { SignedBlockPosition } from "./signed-block-position";

import type { BinaryStream } from "@serenityjs/binarystream";
import type { BlockFace, PlayerActionType } from "../../enums";

class PlayerBlockActionData extends DataType {
  /**
   * The action type of the player.
   */
  public type: PlayerActionType;

  /**
   * The position of the block.
   */
  public position: SignedBlockPosition;

  /**
   * The face of the interacted block.
   */
  public face: BlockFace;

  /**
   * Creates a new instance of the PlayerBlockActionData class.
   * @param type The action type of the player.
   * @param position The position of the block.
   * @param face The face of the interacted block.
   */
  public constructor(
    type: PlayerActionType,
    position: SignedBlockPosition,
    face: BlockFace
  ) {
    super();
    this.type = type;
    this.position = position;
    this.face = face;
  }

  public static read(stream: BinaryStream): PlayerBlockActionData {
    // Read the action type of the player
    const type = stream.readZigZag() as PlayerActionType;

    // Read the position of the block
    const position = SignedBlockPosition.read(stream);

    // Read the face of the interacted block
    const face = stream.readZigZag() as BlockFace;

    // Return a new instance of this class with the action type, position, and face
    return new this(type, position, face);
  }

  public static write(
    stream: BinaryStream,
    value: PlayerBlockActionData
  ): void {
    // Write the action type of the player
    stream.writeZigZag(value.type);

    // Write the position of the block
    SignedBlockPosition.write(stream, value.position);

    // Write the face of the interacted block
    stream.writeZigZag(value.face);
  }
}

export { PlayerBlockActionData };
