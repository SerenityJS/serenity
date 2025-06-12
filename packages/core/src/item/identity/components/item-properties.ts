import { CompoundTag } from "@serenityjs/nbt";

import { ItemTypeComponent } from "./component";

class ItemTypeItemPropertiesComponent extends ItemTypeComponent {
  public static readonly identifier = "item_properties";

  public get component(): CompoundTag {
    return this.collection.get<CompoundTag>(this.identifier)!;
  }
}

export { ItemTypeItemPropertiesComponent };
