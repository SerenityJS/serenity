import { CompoundTag } from "@serenityjs/nbt";

import {
  ItemTypeBlockPlacerComponent,
  ItemTypeBlockPlacerComponentOptions,
  ItemTypeCanDestroyInCreativeComponent,
  ItemTypeCooldownComponent,
  ItemTypeCooldownComponentOptions,
  ItemTypeDamageComponent,
  ItemTypeDiggerComponent,
  ItemTypeDiggerComponentOptions,
  ItemTypeDisplayNameComponent,
  ItemTypeDurabilityComponent,
  ItemTypeDurabilityComponentOptions,
  ItemTypeFoodComponent,
  ItemTypeFoodComponentOptions,
  ItemTypeHandEquippedComponent,
  ItemTypeIconComponent,
  ItemTypeIconComponentOptions,
  ItemTypeMaxStackComponent,
  ItemTypeUseAnimationComponent,
  ItemTypeUseModifiersComponent,
  ItemTypeUseModifiersComponentOptions,
  ItemTypeWearableComponent,
  ItemTypeWearableComponentOptions
} from "./components";
import { ItemType } from "./type";
import { ItemTypeComponent } from "./components/component";

class ItemTypeComponentCollection extends CompoundTag {
  /**
   * The type of item that the components are for.
   */
  protected readonly item: ItemType;

  /**
   * The component definitions of the item type.
   */
  public readonly components = new Map<string, ItemTypeComponent>();

  /**
   * Create a new item component collection.
   * @param item The item type that the components are for.
   */
  public constructor(item: ItemType) {
    // The name of the compound tag.
    super("components");

    // Set the item type that the components are for.
    this.item = item;
  }

  /**
   * Gets the component from the item type.
   * @param component The identifier of the component.
   * @returns The component instance.
   */
  public getComponent<T extends typeof ItemTypeComponent>(
    component: T
  ): InstanceType<T> {
    // Get the component from the collection.
    return this.components.get(component.identifier) as InstanceType<T>;
  }

  /**
   * Checks if the item type has a component.
   * @param component The component to check.
   * @returns True if the item type has the component, false otherwise.
   */
  public hasComponent<T extends typeof ItemTypeComponent>(
    component: T | string
  ): boolean {
    // Get the identifier of the component.
    const identifier =
      typeof component === "string" ? component : component.identifier;

    // Return whether the component exists in the collection.
    return this.components.has(identifier);
  }

  /**
   * Adds a new component to the item type.
   * @param component The component to add.
   * @param args Additional arguments for the component.
   * @returns The component instance.
   */
  public addComponent<
    T extends typeof ItemTypeComponent,
    A extends ConstructorParameters<T>[1]
  >(component: T, ...args: [A]): InstanceType<T> {
    // Check if the component already exists.
    if (this.components.has(component.identifier))
      return this.components.get(component.identifier) as InstanceType<T>;

    // Create the new component.
    const instance = new component(this.item, ...args);

    // Add the component to the collection.
    this.components.set(component.identifier, instance);

    // Return the component instance.
    return instance as InstanceType<T>;
  }

  /**
   * Removes a component from the item type.
   * @param component The component to remove.
   */
  public removeComponent<T extends typeof ItemTypeComponent>(
    component: T
  ): void {
    // Check if the component exists.
    if (!this.components.has(component.identifier)) return;

    // Remove the component from the collection.
    this.components.delete(component.identifier);

    // Remove the component tag from the item type.
    this.delete(component.identifier);
  }

  /**
   * Get all the components of the item type.
   * @returns All the components of the item type.
   */
  public getAllComponents(): Array<ItemTypeComponent> {
    return Array.from(this.components.values());
  }

  /**
   * Check if the item type has a max stack size component.
   * @returns Whether the item type has a max stack size component.
   */
  public hasMaxStackSize(): boolean {
    // Check if the max stack size component exists.
    return this.hasComponent(ItemTypeMaxStackComponent);
  }

  /**
   * Get the max stack size of the item type.
   * @returns The max stack size of the item type.
   */
  public getMaxStackSize(): number {
    // Check if the max stack size component exists.
    if (this.hasComponent(ItemTypeMaxStackComponent)) {
      // Return the max stack size value.
      return this.getComponent(ItemTypeMaxStackComponent).getMaxStackSize();
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
    if (!this.hasComponent(ItemTypeMaxStackComponent)) {
      // Add the max stack size component.
      this.addComponent(ItemTypeMaxStackComponent, value);
    } else {
      // Set the max stack size value.
      this.getComponent(ItemTypeMaxStackComponent).setMaxStackSize(value);
    }
  }

  /**
   * Check if the item type has a block placer component.
   * @returns Whether the item type has a block placer component.
   */
  public hasBlockPlacer(): boolean {
    // Check if the block placer component exists.
    return this.hasComponent(ItemTypeBlockPlacerComponent);
  }

  /**
   * Get the block placer component of the item type.
   * @returns The block placer component of the item type.
   */
  public getBlockPlacer(): ItemTypeBlockPlacerComponent {
    // Check if the block placer component exists.
    if (this.hasComponent(ItemTypeBlockPlacerComponent)) {
      // Return the block placer component.
      return this.getComponent(ItemTypeBlockPlacerComponent);
    } else {
      // Add the block placer component.
      return this.addComponent(ItemTypeBlockPlacerComponent, {});
    }
  }

  /**
   * Set the block placer component of the item type.
   * @param properties The properties of the block placer component
   */
  public setBlockPlacer(
    options?: Partial<ItemTypeBlockPlacerComponentOptions>
  ): void {
    // Check if the block placer component exists.
    if (!this.hasComponent(ItemTypeBlockPlacerComponent)) {
      // Add the block placer component.
      this.addComponent(ItemTypeBlockPlacerComponent, options);
    } else {
      // Get the block placer component
      const component = this.getComponent(ItemTypeBlockPlacerComponent);

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
    return this.hasComponent(ItemTypeDisplayNameComponent);
  }

  /**
   * Get the display name of the item type.
   * @returns The display name of the item type.
   */
  public getDisplayName(): string {
    // Check if the display name component exists.
    if (this.hasComponent(ItemTypeDisplayNameComponent)) {
      // Return the display name value.
      return this.getComponent(ItemTypeDisplayNameComponent).getDisplayName();
    }

    // Return an empty string if the display name component does not exist.
    return "";
  }

  /**
   * Set the display name of the item type.
   * @param value The display name value.
   */
  public setDisplayName(value: string): void {
    // Check if the display name component exists.
    if (!this.hasComponent(ItemTypeDisplayNameComponent)) {
      // Add the display name component.
      this.addComponent(ItemTypeDisplayNameComponent, value);
    } else {
      // Set the display name value.
      this.getComponent(ItemTypeDisplayNameComponent).setDisplayName(value);
    }
  }

  /**
   * Check if the item type has a can destroy in creative component.
   * @returns Whether the item type has a can destroy in creative component.
   */
  public hasCanDestroyInCreative(): boolean {
    // Check if the can destroy in creative component exists.
    return this.hasComponent(ItemTypeCanDestroyInCreativeComponent);
  }

  /**
   * Get whether the item type can destroy blocks in creative mode.
   * @returns Whether the item type can destroy blocks in creative mode.
   */
  public getCanDestroyInCreative(): boolean {
    // Check if the can destroy in creative component exists.
    if (this.hasComponent(ItemTypeCanDestroyInCreativeComponent)) {
      // Get the can destroy in creative component.
      const component = this.getComponent(
        ItemTypeCanDestroyInCreativeComponent
      );

      // Return the can destroy in creative value.
      return component.getCanDestroyInCreative();
    }

    // Return false if the can destroy in creative component does not exist.
    return true;
  }

  /**
   * Set whether the item type can destroy blocks in creative mode.
   * @param value The can destroy in creative value.
   */
  public setCanDestroyInCreative(value: boolean): void {
    // Check if the can destroy in creative component exists.
    if (!this.hasComponent(ItemTypeCanDestroyInCreativeComponent)) {
      // Add the can destroy in creative component.
      this.addComponent(ItemTypeCanDestroyInCreativeComponent, value);
    } else {
      // Set the can destroy in creative value.
      this.getComponent(
        ItemTypeCanDestroyInCreativeComponent
      ).setCanDestroyInCreative(value);
    }
  }

  /**
   * Check if the item type has an icon component.
   * @returns Whether the item type has an icon component.
   */
  public hasIcon(): boolean {
    // Check if the icon component exists.
    return this.hasComponent(ItemTypeIconComponent);
  }

  /**
   * Get the icon of the item type.
   * @returns The icon of the item type.
   */
  public getIcon(): ItemTypeIconComponent {
    // Check if the icon component exists.
    if (this.hasComponent(ItemTypeIconComponent)) {
      // Return the icon component.
      return this.getComponent(ItemTypeIconComponent);
    } else {
      // Add the icon component.
      return this.addComponent(ItemTypeIconComponent, {});
    }
  }

  /**
   * Set the icon of the item type.
   * @param value The icon value.
   */
  public setIcon(options?: Partial<ItemTypeIconComponentOptions>): void {
    // Check if the icon component exists.
    if (!this.hasComponent(ItemTypeIconComponent)) {
      // Add the icon component.
      this.addComponent(ItemTypeIconComponent, options);
    } else {
      // Get the icon component
      const component = this.getComponent(ItemTypeIconComponent);

      // Check if a default texture was provided
      if (options?.default)
        // Set the texture of the icon component.
        component.setDefaultIcon(options.default);

      // Check if a dyed texture was provided
      if (options?.dyed)
        // Set the dyed texture of the icon component.
        component.setDyedIcon(options.dyed);
    }
  }

  /**
   * Check if the item type has a wearable component.
   * @returns Whether the item type has a wearable component.
   */
  public hasWearable(): boolean {
    // Check if the wearable component exists.
    return this.hasComponent(ItemTypeWearableComponent);
  }

  /**
   * Get the wearable component of the item type.
   * @returns The wearable component of the item type.
   */
  public getWearable(): ItemTypeWearableComponent {
    // Check if the wearable component exists.
    if (this.hasComponent(ItemTypeWearableComponent)) {
      // Return the wearable component.
      return this.getComponent(ItemTypeWearableComponent);
    } else {
      // Add the wearable component.
      return this.addComponent(ItemTypeWearableComponent, {});
    }
  }

  /**
   * Set the wearable component of the item type.
   * @param options The options of the wearable component.
   */
  public setWearable(
    options?: Partial<ItemTypeWearableComponentOptions>
  ): void {
    // Check if the wearable component exists.
    if (!this.hasComponent(ItemTypeWearableComponent)) {
      // Add the wearable component.
      this.addComponent(ItemTypeWearableComponent, options);
    } else {
      // Get the wearable component
      const component = this.getComponent(ItemTypeWearableComponent);

      // Check if a slot was provided
      if (options?.slot)
        // Set the slot of the wearable component.
        component.setWearableSlot(options.slot);

      // Check if a protection value was provided
      if (options?.protection)
        // Set the protection value of the wearable component.
        component.setProtection(options.protection);
    }
  }

  /**
   * Check if the item type has a cooldown component.
   * @returns Whether the item type has a cooldown component.
   */
  public hasCooldown(): boolean {
    // Check if the cooldown component exists.
    return this.hasComponent(ItemTypeCooldownComponent);
  }

  /**
   * Get the cooldown component of the item type.
   * @returns The cooldown component of the item type.
   */
  public getCooldown(): ItemTypeCooldownComponent {
    // Check if the cooldown component exists.
    if (this.hasComponent(ItemTypeCooldownComponent)) {
      // Return the cooldown component.
      return this.getComponent(ItemTypeCooldownComponent);
    } else {
      // Add the cooldown component.
      return this.addComponent(ItemTypeCooldownComponent, {});
    }
  }

  /**
   * Set the cooldown component of the item type.
   * @param options The options of the cooldown component.
   */
  public setCooldown(
    options?: Partial<ItemTypeCooldownComponentOptions>
  ): void {
    // Check if the cooldown component exists.
    if (!this.hasComponent(ItemTypeCooldownComponent)) {
      // Add the cooldown component.
      this.addComponent(ItemTypeCooldownComponent, options);
    } else {
      // Get the cooldown component
      const component = this.getComponent(ItemTypeCooldownComponent);

      // Check if a category was provided
      if (options?.category)
        // Set the category of the cooldown component.
        component.setCategory(options.category);

      // Check if a duration was provided
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
    return this.hasComponent(ItemTypeDiggerComponent);
  }

  /**
   * Get the digger component of the item type.
   * @returns The digger component of the item type.
   */
  public getDigger(): ItemTypeDiggerComponent {
    // Check if the digger component exists.
    if (this.hasComponent(ItemTypeDiggerComponent)) {
      // Return the digger component.
      return this.getComponent(ItemTypeDiggerComponent);
    } else {
      // Add the digger component.
      return this.addComponent(ItemTypeDiggerComponent, {});
    }
  }

  /**
   * Set the digger component of the item type.
   * @param options The options of the digger component.
   */
  public setDigger(options?: Partial<ItemTypeDiggerComponentOptions>): void {
    // Check if the digger component exists.
    if (!this.hasComponent(ItemTypeDiggerComponent)) {
      // Add the digger component.
      this.addComponent(ItemTypeDiggerComponent, options);
    } else {
      // Get the digger component
      const component = this.getComponent(ItemTypeDiggerComponent);

      // Check if a destroy speeds value was provided
      if (options?.destroySpeeds)
        // Set the destroy speeds of the digger component.
        component.setDestructionSpeeds(options.destroySpeeds);
    }
  }

  /**
   * Check if the item type has a hand equipped component.
   * @returns Whether the item type has a hand equipped component.
   */
  public hasHandEquipped(): boolean {
    // Check if the hand equipped component exists.
    return this.hasComponent(ItemTypeHandEquippedComponent);
  }

  /**
   * Get the hand equipped component of the item type.
   * @returns The hand equipped component of the item type.
   */
  public getHandEquipped(): ItemTypeHandEquippedComponent {
    // Check if the hand equipped component exists.
    if (this.hasComponent(ItemTypeHandEquippedComponent)) {
      // Return the hand equipped component.
      return this.getComponent(ItemTypeHandEquippedComponent);
    } else {
      // Add the hand equipped component.
      return this.addComponent(ItemTypeHandEquippedComponent, false);
    }
  }

  /**
   * Set the hand equipped component of the item type.
   * @param value The hand equipped value.
   */
  public setHandEquipped(value: boolean): void {
    // Check if the hand equipped component exists.
    if (!this.hasComponent(ItemTypeHandEquippedComponent)) {
      // Add the hand equipped component.
      this.addComponent(ItemTypeHandEquippedComponent, value);
    } else {
      // Set the hand equipped value.
      this.getComponent(ItemTypeHandEquippedComponent).setHandEquipped(value);
    }
  }

  /**
   * Check if the item type has a food component.
   * @returns Whether the item type has a food component.
   */
  public hasFood(): boolean {
    // Check if the food component exists.
    return this.hasComponent(ItemTypeFoodComponent);
  }

  /**
   * Get the food component of the item type.
   * @returns The food component of the item type.
   */
  public getFood(): ItemTypeFoodComponent {
    // Check if the food component exists.
    if (this.hasComponent(ItemTypeFoodComponent)) {
      // Return the food component.
      return this.getComponent(ItemTypeFoodComponent);
    }

    // Add the food component.
    return this.addComponent(ItemTypeFoodComponent, {});
  }

  /**
   * Set the food component of the item type.
   * @param options The options of the food component.
   */
  public setFood(options?: Partial<ItemTypeFoodComponentOptions>): void {
    // Check if the food component exists.
    if (!this.hasComponent(ItemTypeFoodComponent)) {
      // Add the food component.
      this.addComponent(ItemTypeFoodComponent, options);
    } else {
      // Get the food component
      const component = this.getComponent(ItemTypeFoodComponent);

      // Check if a can always eat value was provided
      if (options?.can_always_eat)
        // Set whether the item can always be eaten.
        component.setCanAlwaysEat(options.can_always_eat);

      // Check if a nutrition value was provided
      if (options?.nutrition)
        // Set the nutrition value of the food component.
        component.setNutrition(options.nutrition);

      // Check if a saturation modifier was provided
      if (options?.saturation_modifier)
        // Set the saturation modifier of the food component.
        component.setSaturationModifier(options.saturation_modifier);

      // Check if a using converts to value was provided
      if (options?.using_converts_to)
        // Set the using converts to value of the food component.
        component.setUsingConvertsTo(options.using_converts_to);
    }
  }

  /**
   * Check if the item type has a use modifiers component.
   * @returns Whether the item type has a use modifiers component.
   */
  public hasUseModifiers(): boolean {
    // Check if the item type has a use modifiers component.
    return this.hasComponent(ItemTypeUseModifiersComponent);
  }

  /**
   * Get the use modifiers component of the item type.
   * @returns The use modifiers component of the item type.
   */
  public getUseModifiers(): ItemTypeUseModifiersComponent {
    // Check if the use modifiers component exists.
    if (this.hasComponent(ItemTypeUseModifiersComponent)) {
      // Return the use modifiers component.
      return this.getComponent(ItemTypeUseModifiersComponent);
    } else {
      // Add the use modifiers component.
      return this.addComponent(ItemTypeUseModifiersComponent, {});
    }
  }

  /**
   * Set the use modifiers component of the item type.
   * @param options The options of the use modifiers component.
   */
  public setUseModifiers(
    options?: Partial<ItemTypeUseModifiersComponentOptions>
  ): void {
    // Check if the use modifiers component exists.
    if (!this.hasComponent(ItemTypeUseModifiersComponent)) {
      // Add the use modifiers component.
      this.addComponent(ItemTypeUseModifiersComponent, options);
    } else {
      // Get the use modifiers component
      const component = this.getComponent(ItemTypeUseModifiersComponent);

      // Check if a movement modifier was provided
      if (options?.movement_modifier)
        // Set the movement modifier of the use modifiers component.
        component.setMovementModifier(options.movement_modifier);

      // Check if a use duration was provided
      if (options?.use_duration)
        // Set the use duration of the use modifiers component.
        component.setUseDuration(options.use_duration);
    }
  }

  /**
   * Get the durability component of the item type.
   * @returns The durability component of the item type.
   */
  public getDurability(): ItemTypeComponent {
    // Check if the durability component exists.
    if (this.hasComponent(ItemTypeDurabilityComponent)) {
      // Return the durability component.
      return this.getComponent(ItemTypeDurabilityComponent);
    } else {
      // Add the durability component.
      return this.addComponent(ItemTypeDurabilityComponent, {});
    }
  }

  /**
   * Set the durability component of the item type.
   * @param options The options of the durability component.
   */
  public setDurability(
    options?: Partial<ItemTypeDurabilityComponentOptions>
  ): void {
    // Check if the durability component exists.
    if (!this.hasComponent(ItemTypeDurabilityComponent)) {
      // Add the durability component.
      this.addComponent(ItemTypeDurabilityComponent, options);
    } else {
      // Get the durability component
      const component = this.getComponent(ItemTypeDurabilityComponent);

      // Set the damage chance of the durability component.
      component.setDamageChance(options?.damage_chance ?? { max: 0, min: 0 });

      // Set the max durability of the durability component.
      component.setMaxDurability(options?.max_durability ?? 0);
    }
  }

  /**
   * Check if the item type has a damage component.
   * @returns Whether the item type has a damage component.
   */
  public hasDamage(): boolean {
    // Check if the damage component exists.
    return this.hasComponent(ItemTypeDamageComponent);
  }

  /**
   * Get the damage component of the item type.
   * @returns The damage component of the item type.
   */
  public getDamage(): number {
    // Check if the damage component exists.
    if (this.hasComponent(ItemTypeDamageComponent)) {
      // Return the damage value.
      return this.getComponent(ItemTypeDamageComponent).getDamage();
    }

    // Return the default damage value.
    return 1;
  }

  /**
   * Set the damage component of the item type.
   * @param value The damage value.
   */
  public setDamage(value: number): void {
    // Check if the damage component exists.
    if (!this.hasComponent(ItemTypeDamageComponent)) {
      // Add the damage component.
      this.addComponent(ItemTypeDamageComponent, value);
    } else {
      // Set the damage value.
      this.getComponent(ItemTypeDamageComponent).setDamage(value);
    }
  }

  /**
   * Check if the item type has a use animation component.
   * @returns Whether the item type has a use animation component.
   */
  public hasUseAnimation(): boolean {
    return this.hasComponent(ItemTypeUseAnimationComponent);
  }

  /**
   * Get the use animation of the item type.
   * @returns The use animation of the item type.
   */
  public getUseAnimation(): string {
    if (this.hasComponent(ItemTypeUseAnimationComponent)) {
      return this.getComponent(ItemTypeUseAnimationComponent).getUseAnimation();
    }

    return "none";
  }

  /**
   * Set the use animation of the item type.
   * @param value The use animation value.
   */
  public setUseAnimation(value: string): void {
    if (!this.hasComponent(ItemTypeUseAnimationComponent)) {
      this.addComponent(ItemTypeUseAnimationComponent, value);
    } else {
      this.getComponent(ItemTypeUseAnimationComponent).setUseAnimation(value);
    }
  }
}

export { ItemTypeComponentCollection };
