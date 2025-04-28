import { Vector2f } from "@serenityjs/protocol";

class EntityInputInfo {
  /**
   * The movement vector of the entity input device.
   */
  public readonly movementVector: Vector2f = new Vector2f(0, 0);

  /**
   * The current tick of the entity input device.
   */
  public tick: bigint = 0n;
}

export { EntityInputInfo };
