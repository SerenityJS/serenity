import { CompoundTag } from "@serenityjs/nbt";

import {
  ItemTypeBlockPlacerComponent,
  ItemTypeCanDestroyInCreativeComponent,
  ItemTypeDisplayNameComponent,
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
    return this.entries.get(component.identifier) as InstanceType<T>;
  }

  /**
   * Checks if the item type has a component.
   * @param component The component to check.
   * @returns True if the item type has the component, false otherwise.
   */
  public has<T extends typeof ItemTypeComponent>(component: T): boolean {
    return this.entries.has(component.identifier);
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
   * The max stack size component of the item type.
   */
  public get maxStackSize(): number {
    // Check if the item type has the max stack size component.
    if (!this.has(ItemTypeMaxStackComponent))
      return this.add(ItemTypeMaxStackComponent, 64).value;

    // Get the max stack size component.
    const component = this.get(ItemTypeMaxStackComponent);

    // Return the max stack size value.
    return component.value;
  }

  /**
   * The max stack size component of the item type.
   */
  public set maxStackSize(value: number) {
    // Check if the item type has the max stack size component.
    if (!this.has(ItemTypeMaxStackComponent))
      this.add(ItemTypeMaxStackComponent, value);

    // Get the max stack size component.
    const component = this.get(ItemTypeMaxStackComponent);

    // Set the max stack size value.
    component.value = value;
  }

  /**
   * The block placer component of the item type.
   */
  public get blockPlacer(): ItemTypeBlockPlacerComponent {
    // Check if the item type has the block placer component.
    if (!this.has(ItemTypeBlockPlacerComponent))
      return this.add(ItemTypeBlockPlacerComponent, undefined);

    // Get the block placer component.
    return this.get(ItemTypeBlockPlacerComponent);
  }

  /**
   * The display name component of the item type.
   */
  public get displayName(): string {
    // Check if the item type has the display name component.
    if (!this.has(ItemTypeDisplayNameComponent))
      return this.add(ItemTypeDisplayNameComponent, undefined).value;

    // Get the display name component.
    return this.get(ItemTypeDisplayNameComponent).value;
  }

  /**
   * The display name component of the item type.
   */
  public set displayName(value: string) {
    // Check if the item type has the display name component.
    if (!this.has(ItemTypeDisplayNameComponent))
      this.add(ItemTypeDisplayNameComponent, value);

    // Get the display name component.
    const component = this.get(ItemTypeDisplayNameComponent);

    // Set the display name value.
    component.value = value;
  }

  /**
   * Whether the item type can destroy blocks in creative mode.
   */
  public get canDestroyInCreative(): boolean {
    // Check if the item type has the can destroy in creative component.
    if (!this.has(ItemTypeCanDestroyInCreativeComponent))
      return this.add(ItemTypeCanDestroyInCreativeComponent, true).value;

    // Get the can destroy in creative component.
    return this.get(ItemTypeCanDestroyInCreativeComponent).value;
  }

  /**
   * Whether the item type can destroy blocks in creative mode.
   */
  public set canDestroyInCreative(value: boolean) {
    // Check if the item type has the can destroy in creative component.
    if (!this.has(ItemTypeCanDestroyInCreativeComponent))
      this.add(ItemTypeCanDestroyInCreativeComponent, value);

    // Get the can destroy in creative component.
    const component = this.get(ItemTypeCanDestroyInCreativeComponent);

    // Set the can destroy in creative value.
    component.value = value;
  }

  /**
   * The wearable component of the item type.
   */
  public get wearable(): ItemTypeWearableComponent {
    // Check if the item type has the wearable component.
    if (!this.has(ItemTypeWearableComponent))
      return this.add(ItemTypeWearableComponent, undefined);

    // Get the wearable component.
    return this.get(ItemTypeWearableComponent);
  }
}

export { ItemTypeComponentCollection };
