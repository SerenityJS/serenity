import { ItemIdentifier } from "../../enums";
import { ItemTypeProperties } from "../../types";

import { CreativeItem } from "./creative";
import { ItemType } from "./type";

class CustomItemType extends ItemType {
  protected static networkId = 20000; // Start at 20000 to avoid conflicts with vanilla item types.

  /**
   * Indicates that the item type is custom.
   */
  public readonly custom = true;

  public constructor(
    identifier: string,
    properties?: Partial<ItemTypeProperties>
  ) {
    super(identifier as ItemIdentifier, ++CustomItemType.networkId, properties);

    // Add the properties to the nbt.
    this.nbt.addTag(this.properties);

    // Create a id tag.
    this.nbt.createIntTag({ name: "id", value: this.network });

    // Create a name tag.
    this.nbt.createStringTag({ name: "name", value: this.identifier });

    // Register the custom item type to the creative inventory.
    CreativeItem.register(this, 0);
  }
}

export { CustomItemType };
