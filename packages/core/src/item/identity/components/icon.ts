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

  public get component(): CompoundTag {
    // Get the item properties component.
    const properties = this.collection.addComponent(
      ItemTypeItemPropertiesComponent,
      {}
    );

    // Check if the item properties component exists.
    if (!properties.component.has(this.identifier))
      properties.component.add(new CompoundTag(this.identifier));

    // Return the icon component.
    return properties.component.get<CompoundTag>(this.identifier)!;
  }

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

  /**
   * Get the default icon of the item.
   * @returns The icon of the item.
   */
  public getDefaultIcon(): string {
    // Get the textures component.
    const textures = this.component.get<CompoundTag>("textures");

    // Return the default texture.
    return textures?.get<StringTag>("default")?.valueOf() ?? "";
  }

  /**
   * Set the default icon of the item.
   * @param value The icon of the item.
   */
  public setDefaultIcon(value: string): void {
    // Check if the component contains the textures tag.
    if (!this.component.has("textures"))
      this.component.add(new CompoundTag("textures"));

    // Get the textures tag.
    const textures = this.component.get<CompoundTag>("textures")!;

    // Set the default texture.
    textures.add(new StringTag(value, "default"));
  }

  /**
   * Get the dyed icon of the item.
   * @returns The dyed icon of the item.
   */
  public getDyedIcon(): string {
    // Get the textures component.
    const textures = this.component.get<CompoundTag>("textures");

    // Return the default texture.
    return textures?.get<StringTag>("dyed")?.valueOf() ?? "";
  }

  /**
   * Set the dyed icon of the item.
   * @param value The dyed icon of the item.
   */
  public setDyedIcon(value: string): void {
    // Check if the component contains the textures tag.
    if (!this.component.has("textures"))
      this.component.add(new CompoundTag("textures"));

    // Get the textures tag.
    const textures = this.component.get<CompoundTag>("textures")!;

    // Set the default texture.
    textures.add(new StringTag(value, "dyed"));
  }
}

export { ItemTypeIconComponent, ItemTypeIconComponentOptions };
