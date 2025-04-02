import { DataType } from "@serenityjs/raknet";

import { InputData } from "../../enums";

import { PlayerBlockActionData } from "./player-block-action-data";
import { PlayerAuthInputData } from "./player-auth-input-data";

import type { BinaryStream } from "@serenityjs/binarystream";

class PlayerBlockActions extends DataType {
  /**
   * The block actions performed by the player.
   */
  public readonly actions: Array<PlayerBlockActionData>;

  /**
   * Creates a new instance of the PlayerBlockActions class.
   * @param actions The block actions performed by the player.
   */
  public constructor(actions: Array<PlayerBlockActionData>) {
    super();
    this.actions = actions;
  }

  public static read(
    stream: BinaryStream,
    _: unknown,
    data: PlayerAuthInputData
  ): PlayerBlockActions | null {
    // Check if the input data has the block actions flag
    if (!PlayerAuthInputData.hasFlag(data, InputData.PerformBlockActions))
      return null;

    // Read the amount of block actions
    const count = stream.readZigZag(); // Why

    // Create an array to store the block actions
    const actions: Array<PlayerBlockActionData> = [];

    // Read each block action from the stream
    for (let index = 0; index < count; index++) {
      actions.push(PlayerBlockActionData.read(stream));
    }

    // Return a new instance of this class with the block actions
    return new this(actions);
  }

  public static write(
    stream: BinaryStream,
    value: PlayerBlockActions,
    _: unknown,
    data: PlayerAuthInputData
  ): void {
    // Check if the input data has the block actions flag
    if (!PlayerAuthInputData.hasFlag(data, InputData.PerformBlockActions))
      return;

    // Write the amount of block actions
    stream.writeZigZag(value.actions.length); // Why

    // Write each block action to the stream
    for (const action of value.actions) {
      PlayerBlockActionData.write(stream, action);
    }
  }
}

export { PlayerBlockActions };
