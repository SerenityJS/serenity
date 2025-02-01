import { NetworkItemInstanceDescriptor } from "@serenityjs/protocol";

import { ItemType } from "../identity";

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
   * Creates a new creative item descriptor.
   * @param type The item type of the descriptor.
   * @param descriptor The network item instance descriptor.
   */
  public constructor(
    type: ItemType,
    descriptor?: NetworkItemInstanceDescriptor
  ) {
    this.type = type;
    this.descriptor = descriptor ?? ItemType.toNetworkInstance(type);
  }
}

export { CreativeItemDescriptor };
