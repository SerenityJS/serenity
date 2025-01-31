import { ItemIdentifier } from "../../enums";
import { ItemTypeProperties } from "../../types";

import { ItemType } from "./type";

class CustomItemType extends ItemType {
  protected static networkId = 20000; // Start at 20000 to avoid conflicts with vanilla item types.

  public constructor(
    identifier: string,
    properties?: Partial<ItemTypeProperties>
  ) {
    super(identifier as ItemIdentifier, ++CustomItemType.networkId, properties);

    // Create a id tag.
    this.properties.createIntTag({ name: "id", value: this.network });

    // Create a name tag.
    this.properties.createStringTag({ name: "name", value: this.identifier });
  }
}

export { CustomItemType };
