import { ItemIdentifier } from "../../enums";
import { ItemTypeOptions } from "../types";

import { ItemType } from "./type";

class CustomItemType extends ItemType {
  protected static networkId = 20000; // Start at 20000 to avoid conflicts with vanilla item types.

  /**
   * Create a new custom item type.
   * @param identifier The identifier of the item type.
   * @param options The options of the item type.
   */
  public constructor(identifier: string, options?: Partial<ItemTypeOptions>) {
    super(identifier as ItemIdentifier, ++CustomItemType.networkId, options);
  }
}

export { CustomItemType };
