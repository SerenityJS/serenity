import { CompoundTag } from "@serenityjs/nbt";

import {
  ItemTypeBlockPlacerComponent,
  ItemTypeCanDestroyInCreativeComponent,
  ItemTypeDisplayNameComponent,
  ItemTypeIconComponent,
  ItemTypeMaxStackComponent,
  ItemTypeWearableComponent
} from "./components";
import { ItemType } from "./type";
import { ItemTypeComponent } from "./components/component";

class ItemTypeComponentCollection extends CompoundTag<unknown> {
  /**
   * The type of item that the components are for.
   */
  protected readonly item: ItemType;

  /**
   * The component definitions of the item type.
   */
  public readonly entries = new Map<string, ItemTypeComponent>();

  /**
   * Create a new item component collection.
   * @param item The item type that the components are for.
   */
  public constructor(item: ItemType) {
    // The name of the compound tag.
    super({ name: "components" });

    // Set the item type that the components are for.
    this.item = item;
  }

  /**
   * Gets the component from the item type.
   * @param component The identifier of the component.
   * @returns The component instance.
   */
  public get<T extends typeof ItemTypeComponent>(
    component: T
  ): InstanceType<T> {
    // Check if the component exists.
    if (!this.entries.has(component.identifier))
      return this.add(component, undefined) as InstanceType<T>;

    // Get the component from the collection.
    return this.entries.get(component.identifier) as InstanceType<T>;
  }

  /**
   * Checks if the item type has a component.
   * @param component The component to check.
   * @returns True if the item type has the component, false otherwise.
   */
  public has<T extends typeof ItemTypeComponent>(
    component: T | string
  ): boolean {
    // Get the identifier of the component.
    const identifier =
      typeof component === "string" ? component : component.identifier;

    // Return whether the component exists in the collection.
    return this.entries.has(identifier);
  }

  /**
   * Adds a new component to the item type.
   * @param component The component to add.
   * @param args Additional arguments for the component.
   * @returns The component instance.
   */
  public add<
    T extends typeof ItemTypeComponent,
    A extends ConstructorParameters<T>[1]
  >(component: T, ...args: [A]): InstanceType<T> {
    // Check if the component already exists.
    if (this.entries.has(component.identifier))
      return this.entries.get(component.identifier) as InstanceType<T>;

    // Create the new component.
    const instance = new component(this.item, ...args);

    // Add the component to the collection.
    this.entries.set(component.identifier, instance);

    // Return the component instance.
    return instance as InstanceType<T>;
  }

  /**
   * Removes a component from the item type.
   * @param component The component to remove.
   */
  public remove<T extends typeof ItemTypeComponent>(component: T): void {
    // Check if the component exists.
    if (!this.entries.has(component.identifier)) return;

    // Remove the component from the collection.
    this.entries.delete(component.identifier);

    // Remove the component tag from the item type.
    this.removeTag(component.identifier);
  }

  /**
   * Get all the components of the item type.
   * @returns All the components of the item type.
   */
  public getAll(): Array<ItemTypeComponent> {
    return Array.from(this.entries.values());
  }

  /**
   * Get the max stack size of the item type.
   * @returns The max stack size of the item type.
   */
  public getMaxStackSize(): number {
    // Check if the max stack size component exists.
    if (this.has(ItemTypeMaxStackComponent)) {
      // Return the max stack size value.
      return this.get(ItemTypeMaxStackComponent).value;
    }

    // Return the default max stack size value.
    return 64;
  }

  /**
   * Set the max stack size of the item type.
   * @param value The max stack size value.
   */
  public setMaxStackSize(value: number): void {
    // Check if the max stack size component exists.
    if (this.has(ItemTypeMaxStackComponent)) {
      // Set the max stack size value.
      this.get(ItemTypeMaxStackComponent).value = value;
    } else {
      // Add the max stack size component.
      this.add(ItemTypeMaxStackComponent, value);
    }
  }

  /**
   * Get the block placer component of the item type.
   * @returns The block placer component of the item type.
   */
  public getBlockPlacer(): ItemTypeBlockPlacerComponent {
    // Check if the block placer component exists.
    if (this.has(ItemTypeBlockPlacerComponent)) {
      // Return the block placer component.
      return this.get(ItemTypeBlockPlacerComponent);
    }

    // Add the block placer component.
    return this.add(ItemTypeBlockPlacerComponent, {});
  }

  /**
   * Set the block placer component of the item type.
   * @param properties The properties of the block placer component
   */
  public setBlockPlacer(
    properties?: Partial<ItemTypeBlockPlacerComponent>
  ): void {
    // Check if the block placer component exists.
    if (!this.has(ItemTypeBlockPlacerComponent)) {
      // Add the block placer component.
      this.add(ItemTypeBlockPlacerComponent, properties);
    } else {
      // Get the block placer component
      const component = this.get(ItemTypeBlockPlacerComponent);

      // Check if properties are defined
      if (properties) {
        // Assign the properties to the block placer component
        Object.assign(component, properties);
      }
    }
  }

  /**
   * Get the display name of the item type.
   * @returns The display name of the item type.
   */
  public getDisplayName(): string {
    // Check if the display name component exists.
    if (this.has(ItemTypeDisplayNameComponent)) {
      // Return the display name value.
      return this.get(ItemTypeDisplayNameComponent).value;
    }

    // Return the default display name value.
    return this.item.identifier;
  }

  /**
   * Set the display name of the item type.
   * @param value The display name value.
   */
  public setDisplayName(value: string): void {
    // Check if the display name component exists.
    if (this.has(ItemTypeDisplayNameComponent)) {
      // Set the display name value.
      this.get(ItemTypeDisplayNameComponent).value = value;
    } else {
      // Add the display name component.
      this.add(ItemTypeDisplayNameComponent, value);
    }
  }

  /**
   * Get whether the item type can destroy blocks in creative mode.
   * @returns Whether the item type can destroy blocks in creative mode.
   */
  public getCanDestroyInCreative(): boolean {
    // Check if the can destroy in creative component exists.
    if (this.has(ItemTypeCanDestroyInCreativeComponent)) {
      // Return the can destroy in creative value.
      return this.get(ItemTypeCanDestroyInCreativeComponent).value;
    }

    // Return the default can destroy in creative value.
    return true;
  }

  /**
   * Set whether the item type can destroy blocks in creative mode.
   * @param value The can destroy in creative value.
   */
  public setCanDestroyInCreative(value: boolean): void {
    // Check if the can destroy in creative component exists.
    if (this.has(ItemTypeCanDestroyInCreativeComponent)) {
      // Set the can destroy in creative value.
      this.get(ItemTypeCanDestroyInCreativeComponent).value = value;
    } else {
      // Add the can destroy in creative component.
      this.add(ItemTypeCanDestroyInCreativeComponent, value);
    }
  }

  /**
   * Get the icon of the item type.
   * @returns The icon of the item type.
   */
  public getIcon(): string {
    // Check if the icon component exists.
    if (this.has(ItemTypeIconComponent)) {
      // Return the icon value.
      return this.get(ItemTypeIconComponent).value;
    }

    // Return the default icon value.
    return "";
  }

  /**
   * Set the icon of the item type.
   * @param value The icon value.
   */
  public setIcon(value: string): void {
    // Check if the icon component exists.
    if (this.has(ItemTypeIconComponent)) {
      // Set the icon value.
      this.get(ItemTypeIconComponent).value = value;
    } else {
      // Add the icon component.
      this.add(ItemTypeIconComponent, value);
    }
  }

  /**
   * Get the wearable component of the item type.
   * @returns The wearable component of the item type.
   */
  public getWearable(): ItemTypeWearableComponent {
    // Check if the wearable component exists.
    if (this.has(ItemTypeWearableComponent)) {
      // Return the wearable component.
      return this.get(ItemTypeWearableComponent);
    }

    // Add the wearable component.
    return this.add(ItemTypeWearableComponent, {});
  }

  /**
   * Set the wearable component of the item type.
   * @param properties The properties of the wearable component
   */
  public setWearable(properties?: Partial<ItemTypeWearableComponent>): void {
    // Check if the wearable component exists.
    if (!this.has(ItemTypeWearableComponent)) {
      // Add the wearable component.
      this.add(ItemTypeWearableComponent, properties);
    } else {
      // Get the wearable component
      const component = this.get(ItemTypeWearableComponent);

      // Check if properties are defined
      if (properties) {
        // Assign the properties to the wearable component
        Object.assign(component, properties);
      }
    }
  }
}

export { ItemTypeComponentCollection };
