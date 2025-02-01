import { CompoundTag } from "@serenityjs/nbt";

import { ItemTypeComponent } from "./component";

class ItemTypeItemPropertiesComponent extends ItemTypeComponent {
  public static readonly identifier = "item_properties";

  public get component(): CompoundTag<unknown> {
    return this.collection.getTag<CompoundTag<unknown>>(this.identifier);
  }
}

export { ItemTypeItemPropertiesComponent };
