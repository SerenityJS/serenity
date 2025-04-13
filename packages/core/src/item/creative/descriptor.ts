import { NetworkItemInstanceDescriptor } from "@serenityjs/protocol";

import { ItemType } from "../identity";

import type { ItemStackDataEntry } from "../types";

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
  public readonly stackDataEntry: ItemStackDataEntry | null;

  /**
   * Creates a new creative item descriptor.
   * @param type The item type of the descriptor.
   * @param descriptor The network item instance descriptor.
   * @param stackDataEntry The stack data of the descriptor.
   */
  public constructor(
    type: ItemType,
    descriptor?: NetworkItemInstanceDescriptor,
    stackDataEntry?: ItemStackDataEntry
  ) {
    this.type = type;
    this.descriptor = descriptor ?? ItemType.toNetworkInstance(type);
    this.stackDataEntry = stackDataEntry ?? null;
  }
}

export { CreativeItemDescriptor };
