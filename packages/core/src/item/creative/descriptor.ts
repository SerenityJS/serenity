import { NetworkItemInstanceDescriptor } from "@serenityjs/protocol";

import { ItemType } from "../identity";
import { ItemStackEntry } from "../../types";

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
   * The stack data of the descriptor.
   */
  public readonly stackData: ItemStackEntry | null;

  /**
   * Creates a new creative item descriptor.
   * @param type The item type of the descriptor.
   * @param descriptor The network item instance descriptor.
   */
  public constructor(
    type: ItemType,
    descriptor?: NetworkItemInstanceDescriptor,
    stackData?: ItemStackEntry
  ) {
    this.type = type;
    this.descriptor = descriptor ?? ItemType.toNetworkInstance(type);
    this.stackData = stackData ?? null;
  }
}

export { CreativeItemDescriptor };
