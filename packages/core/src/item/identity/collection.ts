import { CompoundTag } from "@serenityjs/nbt";

import {
  ItemTypeBlockPlacerComponent,
  ItemTypeBlockPlacerComponentOptions,
  ItemTypeCanDestroyInCreativeComponent,
  ItemTypeCooldownComponent,
  ItemTypeCooldownComponentOptions,
  ItemTypeDiggerComponent,
  ItemTypeDiggerComponentOptions,
  ItemTypeDisplayNameComponent,
  ItemTypeHandEquippedComponent,
  ItemTypeIconComponent,
  ItemTypeIconComponentOptions,
  ItemTypeMaxStackComponent,
  ItemTypeWearableComponent,
  ItemTypeWearableComponentOptions
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
   * Check if the item type has a max stack size component.
   * @returns Whether the item type has a max stack size component.
   */
  public hasMaxStackSize(): boolean {
    // Check if the max stack size component exists.
    return this.has(ItemTypeMaxStackComponent);
  }

  /**
   * Get the max stack size of the item type.
   * @returns The max stack size of the item type.
   */
  public getMaxStackSize(): number {
    // Check if the max stack size component exists.
    if (this.has(ItemTypeMaxStackComponent)) {
      // Return the max stack size value.
      return this.get(ItemTypeMaxStackComponent).getMaxStackSize();
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
      this.get(ItemTypeMaxStackComponent).setMaxStackSize(value);
    } else {
      // Add the max stack size component.
      this.add(ItemTypeMaxStackComponent, value);
    }
  }

  /**
   * Check if the item type has a block placer component.
   * @returns Whether the item type has a block placer component.
   */
  public hasBlockPlacer(): boolean {
    // Check if the block placer component exists.
    return this.has(ItemTypeBlockPlacerComponent);
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
    options?: Partial<ItemTypeBlockPlacerComponentOptions>
  ): void {
    // Check if the block placer component exists.
    if (!this.has(ItemTypeBlockPlacerComponent)) {
      // Add the block placer component.
      this.add(ItemTypeBlockPlacerComponent, options);
    } else {
      // Get the block placer component
      const component = this.get(ItemTypeBlockPlacerComponent);

      // Check if a block type was provided
      if (options?.blockType)
        // Set the block type of the block placer component.
        component.setBlockType(options.blockType);

      // Check if a block image was provided
      if (options?.useBlockAsIcon)
        // Set whether to use the block as the icon.
        component.setUseBlockAsIcon(options.useBlockAsIcon);

      // Check if a list of blocks was provided
      if (options?.useOnBlocks)
        // Set the blocks that the item can be used on.
        component.setUseOnBlocks(options.useOnBlocks);
    }
  }

  /**
   * Check if the item type has a display name component.
   * @returns Whether the item type has a display name component.
   */
  public hasDisplayName(): boolean {
    // Check if the display name component exists.
    return this.has(ItemTypeDisplayNameComponent);
  }

  /**
   * Get the display name of the item type.
   * @returns The display name of the item type.
   */
  public getDisplayName(): string {
    // Check if the display name component exists.
    if (this.has(ItemTypeDisplayNameComponent)) {
      // Return the display name value.
      return this.get(ItemTypeDisplayNameComponent).getDisplayName();
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
      this.get(ItemTypeDisplayNameComponent).setDisplayName(value);
    } else {
      // Add the display name component.
      this.add(ItemTypeDisplayNameComponent, value);
    }
  }

  /**
   * Check if the item type has a can destroy in creative component.
   * @returns Whether the item type has a can destroy in creative component.
   */
  public hasCanDestroyInCreative(): boolean {
    // Check if the can destroy in creative component exists.
    return this.has(ItemTypeCanDestroyInCreativeComponent);
  }

  /**
   * Get whether the item type can destroy blocks in creative mode.
   * @returns Whether the item type can destroy blocks in creative mode.
   */
  public getCanDestroyInCreative(): boolean {
    // Check if the can destroy in creative component exists.
    if (this.has(ItemTypeCanDestroyInCreativeComponent)) {
      // Get the can destroy in creative component.
      const component = this.get(ItemTypeCanDestroyInCreativeComponent);

      // Return the can destroy in creative value.
      return component.getCanDestroyInCreative();
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
      // Get the can destroy in creative component.
      const component = this.get(ItemTypeCanDestroyInCreativeComponent);

      // Set the can destroy in creative value.
      component.setCanDestroyInCreative(value);
    } else {
      // Add the can destroy in creative component.
      this.add(ItemTypeCanDestroyInCreativeComponent, value);
    }
  }

  /**
   * Check if the item type has an icon component.
   * @returns Whether the item type has an icon component.
   */
  public hasIcon(): boolean {
    // Check if the icon component exists.
    return this.has(ItemTypeIconComponent);
  }

  /**
   * Get the icon of the item type.
   * @returns The icon of the item type.
   */
  public getIcon(): ItemTypeIconComponent {
    // Check if the icon component exists.
    if (this.has(ItemTypeIconComponent)) {
      // Return the icon component.
      return this.get(ItemTypeIconComponent);
    }

    // Add the icon component.
    return this.add(ItemTypeIconComponent, {});
  }

  /**
   * Set the icon of the item type.
   * @param value The icon value.
   */
  public setIcon(options?: Partial<ItemTypeIconComponentOptions>): void {
    // Check if the icon component exists.
    if (!this.has(ItemTypeIconComponent)) {
      // Add the icon component.
      this.add(ItemTypeIconComponent, options);
    } else {
      // Get the icon component
      const component = this.get(ItemTypeIconComponent);

      // Check if an icon was provided
      if (options?.default) component.setDefaultIcon(options.default);

      // Check if a dyed icon was provided
      if (options?.dyed) component.setDyedIcon(options.dyed);
    }
  }

  /**
   * Check if the item type has a wearable component.
   * @returns Whether the item type has a wearable component.
   */
  public hasWearable(): boolean {
    // Check if the wearable component exists.
    return this.has(ItemTypeWearableComponent);
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
   * @param options The options of the wearable component.
   */
  public setWearable(
    options?: Partial<ItemTypeWearableComponentOptions>
  ): void {
    // Check if the wearable component exists.
    if (!this.has(ItemTypeWearableComponent)) {
      // Add the wearable component.
      this.add(ItemTypeWearableComponent, options);
    } else {
      // Get the wearable component
      const component = this.get(ItemTypeWearableComponent);

      // Check if a protection value was provided
      if (options?.protection)
        // Set the protection value of the wearable component.
        component.setProtection(options.protection);

      // Check if a wearable slot was provided
      if (options?.slot)
        // Set the wearable slot of the wearable component.
        component.setWearableSlot(options.slot);
    }
  }

  /**
   * Check if the item type has a cooldown component.
   * @returns Whether the item type has a cooldown component.
   */
  public hasCooldown(): boolean {
    // Check if the cooldown component exists.
    return this.has(ItemTypeCooldownComponent);
  }

  /**
   * Get the cooldown component of the item type.
   * @returns The cooldown component of the item type.
   */
  public getCooldown(): ItemTypeCooldownComponent {
    // Check if the cooldown component exists.
    if (this.has(ItemTypeCooldownComponent)) {
      // Return the cooldown component.
      return this.get(ItemTypeCooldownComponent);
    }

    // Add the cooldown component.
    return this.add(ItemTypeCooldownComponent, {});
  }

  /**
   * Set the cooldown component of the item type.
   * @param options The options of the cooldown component.
   */
  public setCooldown(
    options?: Partial<ItemTypeCooldownComponentOptions>
  ): void {
    // Check if the cooldown component exists.
    if (!this.has(ItemTypeCooldownComponent)) {
      // Add the cooldown component.
      this.add(ItemTypeCooldownComponent, options);
    } else {
      // Get the cooldown component
      const component = this.get(ItemTypeCooldownComponent);

      // Check if a category was provided
      if (options?.category)
        // Set the category of the cooldown component.
        component.setCategory(options.category);

      // Check if a cooldown was provided
      if (options?.duration)
        // Set the duration of the cooldown component.
        component.setDuration(options.duration);
    }
  }

  /**
   * Check if the item type has a digger component.
   * @returns Whether the item type has a digger component.
   */
  public hasDigger(): boolean {
    // Check if the digger component exists.
    return this.has(ItemTypeDiggerComponent);
  }

  /**
   * Get the digger component of the item type.
   * @returns The digger component of the item type.
   */
  public getDigger(): ItemTypeDiggerComponent {
    // Check if the digger component exists.
    if (this.has(ItemTypeDiggerComponent)) {
      // Return the digger component.
      return this.get(ItemTypeDiggerComponent);
    }

    // Add the digger component.
    return this.add(ItemTypeDiggerComponent, {});
  }

  /**
   * Set the digger component of the item type.
   * @param options The options of the digger component.
   */
  public setDigger(options?: Partial<ItemTypeDiggerComponentOptions>): void {
    // Check if the digger component exists.
    if (!this.has(ItemTypeDiggerComponent)) {
      // Add the digger component.
      this.add(ItemTypeDiggerComponent, options);
    } else {
      // Get the digger component
      const component = this.get(ItemTypeDiggerComponent);

      // Check if a speed was provided
      if (options?.destroySpeeds)
        // Set the destruction speeds of the digger component.
        component.setDestructionSpeeds(options.destroySpeeds);
    }
  }

  /**
   * Check if the item type has a hand equipped component.
   * @returns Whether the item type has a hand equipped component.
   */
  public hasHandEquipped(): boolean {
    // Check if the hand equipped component exists.
    return this.has(ItemTypeHandEquippedComponent);
  }

  /**
   * Get the hand equipped component of the item type.
   * @returns The hand equipped component of the item type.
   */
  public getHandEquipped(): ItemTypeHandEquippedComponent {
    // Check if the hand equipped component exists.
    if (this.has(ItemTypeHandEquippedComponent)) {
      // Return the hand equipped component.
      return this.get(ItemTypeHandEquippedComponent);
    }

    // Add the hand equipped component.
    return this.add(ItemTypeHandEquippedComponent, false);
  }

  /**
   * Set the hand equipped component of the item type.
   * @param value The hand equipped value.
   */
  public setHandEquipped(value: boolean): void {
    // Check if the hand equipped component exists.
    if (this.has(ItemTypeHandEquippedComponent)) {
      // Set the hand equipped value.
      this.get(ItemTypeHandEquippedComponent).setHandEquipped(value);
    } else {
      // Add the hand equipped component.
      this.add(ItemTypeHandEquippedComponent, value);
    }
  }
}

export { ItemTypeComponentCollection };
