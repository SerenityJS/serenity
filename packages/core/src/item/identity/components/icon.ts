import { CompoundTag, StringTag } from "@serenityjs/nbt";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";
import { ItemTypeItemPropertiesComponent } from "./item-properties";

interface ItemTypeIconComponentOptions {
  /**
   * The default icon of the item.
   */
  default: string;

  /**
   * The dyed icon of the item.
   */
  dyed: string;
}

class ItemTypeIconComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:icon";

  /**
   * Creates a new icon component.
   * @param type The type of the item.
   * @param options The options for the icon component.
   */
  public constructor(
    type: ItemType,
    options?: Partial<ItemTypeIconComponentOptions>
  ) {
    // Call the parent constructor.
    super(type);

    // Set the icon and dyed icon of the item.
    this.setDefaultIcon(options?.default ?? "");
    this.setDyedIcon(options?.dyed ?? "");
  }

  private getProperties(): ItemTypeItemPropertiesComponent {
    // Get the item properties component.
    const properties = this.collection.get(ItemTypeItemPropertiesComponent);

    // Check if the item properties component is null.
    return properties;
  }

  /**
   * Get the default icon of the item.
   * @returns The icon of the item.
   */
  public getDefaultIcon(): string {
    // Get the icon component from the item properties.
    const component = this.getProperties().component.getTag<
      CompoundTag<unknown>
    >(this.identifier);

    // Get the textures component.
    const textures = component?.getTag<CompoundTag<unknown>>("textures");

    // Return the default texture.
    return textures?.getTag<StringTag>("default")?.value;
  }

  /**
   * Set the default icon of the item.
   * @param value The icon of the item.
   */
  public setDefaultIcon(value: string): void {
    // Get the icon component from the item properties.
    const component = this.getProperties().component.createCompoundTag({
      name: this.identifier
    });

    // Get the textures component.
    const textures = component.createCompoundTag({ name: "textures" });

    // Set the default texture.
    textures.createStringTag({ name: "default", value });
  }

  /**
   * Get the dyed icon of the item.
   * @returns The dyed icon of the item.
   */
  public getDyedIcon(): string {
    // Get the icon component from the item properties.
    const component = this.getProperties().component.getTag<
      CompoundTag<unknown>
    >(this.identifier);

    // Get the textures component.
    const textures = component?.getTag<CompoundTag<unknown>>("textures");

    // Return the default texture.
    return textures?.getTag<StringTag>("dyed")?.value;
  }

  /**
   * Set the dyed icon of the item.
   * @param value The dyed icon of the item.
   */
  public setDyedIcon(value: string): void {
    // Get the icon component from the item properties.
    const component = this.getProperties().component.createCompoundTag({
      name: this.identifier
    });

    // Get the textures component.
    const textures = component.createCompoundTag({ name: "textures" });

    // Set the default texture.
    textures.createStringTag({ name: "dyed", value });
  }
}

export { ItemTypeIconComponent, ItemTypeIconComponentOptions };
