import { NetworkItemInstanceDescriptor } from "@serenityjs/protocol";

import { ItemType } from "../identity";
import { ItemStackLevelStorage } from "../storage";

class CreativeItemDescriptor {
  /**
   * The item type of the descriptor.
   */
  public readonly type: ItemType;

  /**
   * The network item instance descriptor.
   */
  public readonly descriptor: NetworkItemInstanceDescriptor;

  /**
   * The level storage for the item stack.
   */
  public readonly stackStorage: ItemStackLevelStorage | null;

  /**
   * Creates a new creative item descriptor.
   * @param type The item type of the descriptor.
   * @param descriptor The network item instance descriptor.
   * @param stackStorage The level storage for the item stack.
   */
  public constructor(
    type: ItemType,
    descriptor?: NetworkItemInstanceDescriptor,
    stackStorage?: ItemStackLevelStorage | null
  ) {
    this.type = type;
    this.descriptor = descriptor ?? ItemType.toNetworkInstance(type);
    this.stackStorage = stackStorage ?? null;
  }
}

export { CreativeItemDescriptor };
