import { DataType } from "@serenityjs/raknet";

import { PlayerActionType } from "../../enums";

import { Vector3f } from "./vector3f";

import type { BinaryStream } from "@serenityjs/binarystream";

class BlockAction extends DataType {
  public action!: PlayerActionType;

  /**  If action is startBreak or abortBreak or crackBreak or predictBreak or continueBreak */
  public position!: Vector3f | undefined;
  /**  If action is startBreak or abortBreak or crackBreak or predictBreak or continueBreak */
  public face!: number | undefined;

  public constructor(
    action: PlayerActionType,
    position?: Vector3f,
    face?: number
  ) {
    super();
    this.action = action;
    this.position = position;
    this.face = face;
  }

  public static write(stream: BinaryStream, value: BlockAction): void {
    stream.writeZigZag(value.action);

    if (
      value.action == PlayerActionType.StartDestroyBlock ||
      value.action == PlayerActionType.AbortDestroyBlock ||
      value.action == PlayerActionType.CrackBlock ||
      value.action == PlayerActionType.PredictDestroyBlock ||
      value.action == PlayerActionType.ContinueDestroyBlock
    ) {
      if (value.position === undefined || value.position === null)
        throw new Error(
          "Position is not defined but action is startBreak or abortBreak or crackBreak or predictBreak or continueBreak"
        );
      if (value.face === undefined || value.face === null)
        throw new Error(
          "Face is not defined but action is startBreak or abortBreak or crackBreak or predictBreak or continueBreak"
        );
      stream.writeZigZag(value.position.x);
      stream.writeZigZag(value.position.y);
      stream.writeZigZag(value.position.z);
      stream.writeZigZag(value.face);
    } else {
      stream.writeVarInt(0);
      stream.writeZigZag(0);
      stream.writeZigZag(0);
      stream.writeZigZag(0);
    }
  }

  public static read(stream: BinaryStream): BlockAction {
    const action = stream.readZigZag();
    const position = new Vector3f(
      stream.readZigZag(),
      stream.readZigZag(),
      stream.readZigZag()
    );
    const face = stream.readZigZag();
    return new BlockAction(action, position, face);
  }
}

export { BlockAction };
