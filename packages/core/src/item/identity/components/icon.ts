import { CompoundTag, StringTag } from "@serenityjs/nbt";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";
import { ItemTypeItemPropertiesComponent } from "./item-properties";

class ItemTypeIconComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:icon";

  /**
   * The default texture of the item.
   */
  public get value(): string {
    // Get the item properties component.
    const propeties = this.collection.get(ItemTypeItemPropertiesComponent);

    // Get the icon component.
    const component = propeties.component.getTag<CompoundTag<unknown>>(
      this.identifier
    );

    // Get the textures component.
    const textures = component?.getTag<CompoundTag<unknown>>("textures");

    // Return the default texture.
    return textures?.getTag<StringTag>("default")?.value;
  }

  /**
   * The default texture of the item.
   */
  public set value(value: string) {
    // Get the item properties component.
    const propeties = this.collection.get(ItemTypeItemPropertiesComponent);

    // Get the icon component.
    const component = propeties.component.createCompoundTag({
      name: this.identifier
    });

    // Get the textures component.
    const textures = component.createCompoundTag({ name: "textures" });

    // Set the default texture.
    textures.createStringTag({ name: "default", value });
  }

  /**
   * Creates a new icon component.
   * @param type The type of the item.
   */
  public constructor(type: ItemType) {
    super(type);

    // Create the textures compound tag.
    // this.component.createCompoundTag({ name: "textures" });
  }
}

export { ItemTypeIconComponent };
