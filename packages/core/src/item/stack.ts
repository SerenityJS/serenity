import {
  CompletedUsingItemPacket,
  ItemUseMethod,
  NetworkItemInstanceDescriptor,
  NetworkItemStackDescriptor
} from "@serenityjs/protocol";
import { CompoundTag } from "@serenityjs/nbt";

import { Container } from "../container";
import { ItemIdentifier } from "../enums";
import { JSONLikeValue } from "../types";
import { Player } from "../entity";
import { World } from "../world";
import {
  PlayerUseItemOnBlockSignal,
  PlayerUseItemOnEntitySignal,
  PlayerUseItemSignal
} from "../events";

import {
  ItemType,
  ItemTypeBlockPlacerComponent,
  type ItemTypeComponent,
  ItemTypeComponentCollection
} from "./identity";
import { ItemStackDisplayTrait, ItemStackTrait } from "./traits";
import { ItemStackNbtMap } from "./maps";
import {
  type ItemStackOptions,
  type ItemStackUseOptions,
  type ItemStackUseOnBlockOptions,
  type ItemStackUseOnEntityOptions,
  DefaultItemStackOptions
} from "./types";
import { ItemStackLevelStorage } from "./storage";

class ItemStack {
  /**
   * The type of the item stack.
   */
  public readonly type: ItemType;

  /**
   * The identifier of the item stack.
   */
  public readonly identifier: ItemIdentifier | string;

  /**
   * The dynamic properties of the item stack.
   */
  public readonly dynamicProperties = new Map<string, JSONLikeValue>();

  /**
   * The traits of the item stack.
   */
  public readonly traits = new Map<string, ItemStackTrait>();

  /**
   * The nbt data of the item stack.
   */
  public readonly nbt = new ItemStackNbtMap(this);

  /**
   * The world the item stack is in.
   */
  public world!: World;

  /**
   * The container the item stack is in.
   * If the item stack is not in a container, this will be null.
   */
  public container: Container | null = null;

  /**
   * The amount of the item stack.
   */
  public stackSize: number;

  /**
   * The maximum stack size of the item stack.
   * This is the maximum amount of items that can be stacked in a single item stack.
   */
  public maxStackSize: number = 64; // Default max stack size

  /**
   * Whether the item stack is stackable.
   * If true, the item stack can be stacked with other item stacks of the same type.
   */
  public isStackable: boolean = true; // Default stackable state

  /**
   * The metadata value of the item stack.
   */
  public metadata: number;

  /**
   * The slot of the item stack in the container.
   */
  public get slot(): number {
    return this.container?.storage.indexOf(this) ?? -1;
  }

  /**
   * The slot of the item stack in the container.
   */
  public set slot(value: number) {
    // Check if the item is not in a container.
    if (!this.container) return;

    // Set the item in the container.
    this.container.swapItems(this.slot, value);
  }

  /**
   * The components of the item stack type.
   */
  public get components(): ItemTypeComponentCollection {
    return this.type.components;
  }

  /**
   * Create a new item stack instance.
   * @param identifier The identifier or item type of the item stack.
   * @param options The options for the item stack.
   */
  public constructor(
    identifier: ItemIdentifier | ItemType | string,
    options?: Partial<ItemStackOptions>
  ) {
    // Spread the default properties and the provided properties
    options = { ...DefaultItemStackOptions, ...options };

    // Assign the properties to the item stack
    this.stackSize = options.stackSize as number;
    this.metadata = options.metadata as number;

    // Check if a world was provided
    if (options.world) {
      // Assign the world to the item stack
      this.world = options.world;

      // Check if the provided identifier is an item type or string
      if (identifier instanceof ItemType) {
        // If the identifier is an item type, set the type and identifier
        this.type = identifier;
        this.identifier = this.type.identifier;
      } else {
        // If the identifier is a string, get the item type from the world item palette
        const type = this.world.itemPalette.getType(identifier);

        // Check if the item type exists in the world item palette
        if (!type)
          throw new Error(
            `Item type "${identifier}" not found in the world item palette.`
          );

        // Set the type and identifier of the item stack
        this.type = type;
        this.identifier = this.type.identifier;
      }

      // Set the properties that are component based
      this.maxStackSize = this.type.components.getMaxStackSize();
      this.isStackable = this.maxStackSize > 1;

      // Check if a level storage was provided
      if (options.storage)
        // Load the level storage for the item stack
        this.loadLevelStorage(options.world, options.storage);
    } else {
      // If no world was provided, and the identifier is a item type
      if (identifier instanceof ItemType) {
        // Set the type and identifier of the item stack
        this.type = identifier;
        this.identifier = this.type.identifier;
      } else {
        // Attempt to get the item type from the item global palette
        const type = ItemType.get(identifier);

        // Check if the item type exists in the global item palette
        if (!type)
          throw new Error(
            `Item type "${identifier}" not found in the global item palette.`
          );

        // Set the type and identifier of the item stack
        this.type = type;
        this.identifier = this.type.identifier;
      }
    }

    // Iterate over the traits of the item type
    for (const [, trait] of this.type.traits) this.addTrait(trait);

    // Add base the nbt properties to the item stack
    this.nbt.push(...this.type.properties.values());
  }

  /**
   * Updates the item stack in the container.
   */
  public update(): void {
    // Check if the item is in a container.
    if (!this.container) return;

    // Get the slot of the item in the container.
    const slot = this.container.storage.indexOf(this);

    // Check if the item is 0 or less.
    if (this.stackSize <= 0) {
      // Remove the item from the container.
      this.container.clearSlot(slot);
    }

    // Set the item in the container.
    else this.container.setItem(slot, this);
  }

  /**
   * Set the size of the item stack.
   * @param size The size to set.
   */
  public setStackSize(size: number): void {
    // Update the size of the item stack.
    this.stackSize = size;

    // Update the item in the container.
    this.update();
  }

  /**
   * Decrements the size of the item stack.
   * @param size The size to decrement.
   */
  public decrementStack(size?: number): void {
    this.setStackSize(this.stackSize - (size ?? 1));
  }

  /**
   * Increments the size of the item stack.
   * @param size The size to increment.
   */
  public incrementStack(size?: number): void {
    this.setStackSize(this.stackSize + (size ?? 1));
  }

  /**
   * Causes a player to use the item stack.
   * @param player The player using the item.
   * @param options The options for the item use.
   * @returns Whether the item use was successful; default is true.
   */
  public use(
    player: Player,
    options: ItemStackUseOptions
  ): boolean | ItemUseMethod {
    // Trigger the item onUse trait event
    let canceled = false;
    for (const trait of this.traits.values()) {
      // Set the canceled flag in the options
      options.canceled = canceled;

      // Attempt to trigger the onUse trait event
      try {
        // Check if the start break was successful
        const success = trait.onUse?.(player, options);

        // If the result is undefined, continue
        // As the trait does not implement the method
        if (success === undefined) continue;

        // Check if the result is a number
        // If so, this indicates a correction to the use method
        if (typeof success === "number") {
          // Create a new CompletedUsingItemPacket
          const packet = new CompletedUsingItemPacket();
          packet.itemNetworkId = this.type.network;
          packet.useMethod = success;

          // Send the packet to the player
          player.send(packet);

          // Attempt to use the item with the corrected method
          return this.use(player, { ...options, method: success });
        }

        // If the result is false, cancel the break
        canceled = !success;
      } catch (reason) {
        // Log the error to the console
        player.world.serenity.logger.error(
          `Failed to trigger onUse trait event for item "${this.type.identifier}" in dimension "${player.dimension.identifier}"`,
          reason
        );

        // Remove the trait from the item
        this.traits.delete(trait.identifier);
      }
    }

    // Create a new PlayerUseItem signal
    const signal = new PlayerUseItemSignal(player, this, options.method);

    // Return whether the item use was canceled
    return !canceled && signal.emit();
  }

  public useOnBlock(
    player: Player,
    options: ItemStackUseOnBlockOptions
  ): boolean | ItemUseMethod {
    // Trigger the item onUse trait event
    let canceled = false;
    for (const trait of this.traits.values()) {
      // Set the canceled flag in the options
      options.canceled = canceled;

      // Attempt to trigger the onUse trait event
      try {
        // Check if the start break was successful
        const success = trait.onUseOnBlock?.(player, options);

        // If the result is undefined, continue
        // As the trait does not implement the method
        if (success === undefined) continue;

        // Check if the result is a number
        // If so, this indicates a correction to the use method
        if (typeof success === "number") {
          // Create a new CompletedUsingItemPacket
          const packet = new CompletedUsingItemPacket();
          packet.itemNetworkId = this.type.network;
          packet.useMethod = success;

          // Send the packet to the player
          player.send(packet);

          // Attempt to use the item on the block with the corrected method
          return this.useOnBlock(player, { ...options, method: success });
        }

        // If the result is false, cancel the break
        canceled = !success;
      } catch (reason) {
        // Log the error to the console
        player.world.serenity.logger.error(
          `Failed to trigger onUseOnBlock trait event for item "${this.type.identifier}" in dimension "${player.dimension.identifier}"`,
          reason
        );

        // Remove the trait from the item
        this.traits.delete(trait.identifier);
      }
    }

    // Create a new PlayerUseItemOnBlock signal
    const signal = new PlayerUseItemOnBlockSignal(
      player,
      this,
      options.method,
      options.targetBlock
    );

    // Return whether the item use was canceled
    return !canceled && signal.emit();
  }

  public useOnEntity(
    player: Player,
    options: ItemStackUseOnEntityOptions
  ): boolean | ItemUseMethod {
    // Trigger the item onUse trait event
    let canceled = false;
    for (const trait of this.traits.values()) {
      // Set the canceled flag in the options
      options.canceled = canceled;

      // Attempt to trigger the onUse trait event
      try {
        // Check if the start break was successful
        const success = trait.onUseOnEntity?.(player, options);

        // If the result is undefined, continue
        // As the trait does not implement the method
        if (success === undefined) continue;

        // Check if the result is a number
        // If so, this indicates a correction to the use method
        if (typeof success === "number") {
          // Create a new CompletedUsingItemPacket
          const packet = new CompletedUsingItemPacket();
          packet.itemNetworkId = this.type.network;
          packet.useMethod = success;

          // Send the packet to the player
          player.send(packet);

          // Attempt to use the item on the entity with the corrected method
          return this.useOnEntity(player, { ...options, method: success });
        }

        // If the result is false, cancel the break
        canceled = !success;
      } catch (reason) {
        // Log the error to the console
        player.world.serenity.logger.error(
          `Failed to trigger onUseOnEntity trait event for item "${this.type.identifier}" in dimension "${player.dimension.identifier}"`,
          reason
        );

        // Remove the trait from the item
        this.traits.delete(trait.identifier);
      }
    }

    // Create a new PlayerUseItemOnEntity signal
    const signal = new PlayerUseItemOnEntitySignal(
      player,
      this,
      options.method,
      options.targetEntity
    );

    // Return whether the item use was canceled
    return !canceled && signal.emit();
  }

  /**
   * Start a cooldown for the item stack.
   * @param duration The duration of the cooldown in ticks.
   */
  public startCooldown(duration: number): void {
    // Call the onStartCooldown trait event
    for (const [identifier, trait] of this.traits) {
      // Attempt to trigger the onStartCooldown trait event
      try {
        trait.onStartCooldown?.(duration);
      } catch (reason) {
        // Log the error to the console
        this.world.serenity.logger.error(
          `Failed to trigger onStartCooldown trait event for item "${this.type.identifier}"`,
          reason
        );

        // Remove the trait from the item
        this.traits.delete(identifier);
      }
    }

    // Create a new schedule for the cooldown
    this.world.schedule(duration).on(() => {
      // Call the onStopCooldown trait event
      for (const [identifier, trait] of this.traits) {
        // Attempt to trigger the onStopCooldown trait event
        try {
          trait.onStopCooldown?.();
        } catch (reason) {
          // Log the error to the console
          this.world.serenity.logger.error(
            `Failed to trigger onStopCooldown trait event for item "${this.type.identifier}"`,
            reason
          );

          // Remove the trait from the item
          this.traits.delete(identifier);
        }
      }
    });
  }

  /**
   * Whether the itemstack has the specified trait.
   * @param trait The trait to check for
   * @returns Whether the itemstack has the trait
   */
  public hasTrait(trait: string | typeof ItemStackTrait): boolean {
    return this.traits.has(
      typeof trait === "string" ? trait : trait.identifier
    );
  }

  /**
   * Gets the specified trait from the itemstack.
   * @param trait The trait to get from the itemstack
   * @returns The trait if it exists, otherwise null
   */
  public getTrait<K extends typeof ItemStackTrait>(trait: K): InstanceType<K>;

  /**
   * Gets the specified trait from the itemstack.
   * @param trait The trait to get from the itemstack
   * @returns The trait if it exists, otherwise null
   */
  public getTrait(trait: string): ItemStackTrait | null;

  /**
   * Gets the specified trait from the itemstack.
   * @param trait The trait to get from the itemstack
   * @returns The trait if it exists, otherwise null
   */
  public getTrait(
    trait: string | typeof ItemStackTrait
  ): ItemStackTrait | null {
    return this.traits.get(
      typeof trait === "string" ? trait : trait.identifier
    ) as ItemStackTrait | null;
  }

  /**
   * Removes the specified trait from the itemstack.
   * @param trait The trait to remove
   */
  public removeTrait(trait: string | typeof ItemStackTrait): void {
    // Get the trait from the itemstack
    const instance = this.traits.get(
      typeof trait === "string" ? trait : trait.identifier
    );

    // Call the onRemove trait event
    instance?.onRemove?.();

    // Remove the trait from the itemstack
    this.traits.delete(typeof trait === "string" ? trait : trait.identifier);
  }

  /**
   * Adds a trait to the itemstack.
   * @param trait The trait to add to the itemstack.
   * @param options The additional options to pass to the trait.
   * @returns The trait instance that was added to the itemstack.
   */
  public addTrait<K extends typeof ItemStackTrait>(
    trait: K | ItemStackTrait,
    options?: ConstructorParameters<K>[1]
  ): InstanceType<K> {
    // Check if the trait already exists
    if (this.traits.has(trait.identifier))
      return this.getTrait(trait.identifier) as InstanceType<K>;

    // Attempt to add the trait to the itemstack
    try {
      // Check if the trait is an instance of ItemStackTrait
      if (trait instanceof ItemStackTrait) {
        // Add the trait to the itemstack
        this.traits.set(trait.identifier, trait);

        // Call the onAdd trait event
        trait.onAdd?.();

        // Return the trait that was added
        return trait as InstanceType<K>;
      } else {
        // Create a new instance of the trait
        const instance = new trait(this, options);

        // Add the trait to the itemstack
        this.traits.set(instance.identifier, instance);

        // Call the onAdd trait event
        instance.onAdd?.();

        // Return the trait that was added
        return instance as InstanceType<K>;
      }
    } catch (reason) {
      // Log the error to the console
      this.world.logger.error(
        `Failed to add trait "${trait.identifier}" to itemstack "${this.type.identifier}"`,
        reason
      );

      // Return null as the trait was not added
      return null as InstanceType<K>;
    }
  }

  /**
   * Checks if the itemstack has the specified component.
   * @param component The component to check for.
   * @returns Whether the itemstack has the component.
   */
  public hasComponent(component: string | typeof ItemTypeComponent): boolean {
    return this.components.hasComponent(
      typeof component === "string" ? component : component.identifier
    );
  }

  /**
   * Gets the specified component from the itemstack.
   * @param component The component to get from the itemstack.
   * @returns The component instance.
   */
  public getComponent<K extends typeof ItemTypeComponent>(
    component: K
  ): InstanceType<K> {
    return this.components.getComponent(component) as InstanceType<K>;
  }

  /**
   * Checks if the itemstack has the specified dynamic property.
   * @param key The key of the dynamic property.
   * @returns Whether the itemstack has the dynamic property.
   */
  public hasDynamicProperty(key: string): boolean {
    return this.dynamicProperties.has(key);
  }

  /**
   * Gets the specified dynamic property from the itemstack.
   * @param key The key of the dynamic property.
   * @returns The dynamic property if it exists, otherwise null
   */
  public getDynamicProperty<T extends JSONLikeValue>(key: string): T | null {
    return this.dynamicProperties.get(key) as T | null;
  }

  /**
   * Removes the specified dynamic property from the itemstack.
   * @param key The key of the dynamic property.
   */
  public removeDynamicProperty(key: string): void {
    this.dynamicProperties.delete(key);
  }

  /**
   * Adds a dynamic property to the itemstack.
   * @param key The key of the dynamic property.
   * @param value The value of the dynamic property.
   */
  public addDynamicProperty<T extends JSONLikeValue>(
    key: string,
    value: T
  ): void {
    this.dynamicProperties.set(key, value);
  }

  /**
   * Sets the specified dynamic property of the itemstack.
   * @param key The key of the dynamic property.
   * @param value The value of the dynamic property.
   */
  public setDynamicProperty<T extends JSONLikeValue>(
    key: string,
    value: T
  ): void {
    this.dynamicProperties.set(key, value);
  }

  /**
   * Get the display name of the item stack.
   * @note This method depends on the `ItemStackDisplayTrait`.
   * @returns the display name of the item stack.
   */
  public getDisplayName(): string {
    // Check if the item stack has a display trait.
    if (this.hasTrait(ItemStackDisplayTrait)) {
      // Get the display trait from the item stack.
      const display = this.getTrait(ItemStackDisplayTrait);

      // Return the display name if it exists.
      return display.getDisplayName() ?? "";
    }

    // Return empty string if the item type does not have a display name.
    return "";
  }

  /**
   * Set the display name of the item stack.
   * @note This method depends on the `ItemStackDisplayTrait`, or adds it if it does not exist.
   * @param name The display name to set for the item stack.
   */
  public setDisplayName(name: string | null): void {
    // Check if the item stack has a display trait.
    if (this.hasTrait(ItemStackDisplayTrait)) {
      // Get the display trait from the item stack.
      const display = this.getTrait(ItemStackDisplayTrait);

      // Set the display name of the item stack.
      display.setDisplayName(name);
    } else {
      // Add a new display trait to the item stack.
      this.addTrait(ItemStackDisplayTrait, { displayName: name });
    }
  }

  /**
   * Get the lore of the item stack.
   * @note This method depends on the `ItemStackDisplayTrait`.
   * @returns The lore of the item stack.
   */
  public getLore(): Array<string> {
    // Check if the item stack has a display trait.
    if (this.hasTrait(ItemStackDisplayTrait)) {
      // Get the display trait from the item stack.
      const display = this.getTrait(ItemStackDisplayTrait);

      // Return the lore of the item stack.
      return display.getLore();
    }

    // Return an empty array if the item stack does not have a display trait.
    return [];
  }

  /**
   * Set the lore of the item stack.
   * @note This method depends on the `ItemStackDisplayTrait`, or adds it if it does not exist.
   * @param lore The lore to set for the item stack.
   */
  public setLore(lore: Array<string>): void {
    // Check if the item stack has a display trait.
    if (this.hasTrait(ItemStackDisplayTrait)) {
      // Get the display trait from the item stack.
      const display = this.getTrait(ItemStackDisplayTrait);

      // Set the lore of the item stack.
      display.setLore(lore);
    } else {
      // Add a new display trait to the item stack with the lore.
      this.addTrait(ItemStackDisplayTrait, { lore });
    }
  }

  public equals(other: ItemStack): boolean {
    // Check if the identifiers & aux are equal.
    if (this.type.identifier !== other.type.identifier) return false;
    if (this.metadata !== other.metadata) return false;
    if (this.dynamicProperties.size !== other.dynamicProperties.size)
      return false;
    if (this.traits.size !== other.traits.size) return false;
    if (this.nbt.size !== other.nbt.size) return false;

    // Stringify the dynamicProperties.
    const dynamicProperties = JSON.stringify([
      ...this.dynamicProperties.entries()
    ]);

    const otherDynamicProperties = JSON.stringify([
      ...other.dynamicProperties.entries()
    ]);

    // Check if the dynamicProperties are equal.
    if (dynamicProperties !== otherDynamicProperties) return false;

    // Iterate over the traits.
    for (const [identifier, trait] of this.traits) {
      // Get the other trait.
      const otherTrait = other.traits.get(identifier) as ItemStackTrait;

      // Check if the other trait exists.
      if (!otherTrait) return false;

      // Check if the traits are equal.
      if (!trait.equals(otherTrait)) return false;
    }

    // Iterate over the nbt.
    for (const [key, value] of this.nbt) {
      // Get the other value.
      const otherValue = other.nbt.get(key);

      // Check if the other value exists.
      if (!otherValue) return false;

      // Get the snbt values of the nbt.
      const snbt = JSON.stringify(value.toJSON());
      const otherSnbt = JSON.stringify(otherValue.toJSON());

      // Check if the nbt values are equal.
      if (snbt !== otherSnbt) return false;
    }

    // Return true if the item stacks are equal.
    return true;
  }

  public getLevelStorage(): ItemStackLevelStorage {
    // Create a new level storage for the item stack.
    const storage = new ItemStackLevelStorage();

    // Set the properties of the level storage.
    storage.setIdentifier(this.identifier);
    storage.setStackSize(this.stackSize);
    storage.setMetadata(this.metadata);
    storage.setStackNbt(this.nbt);
    storage.setDynamicProperties([...this.dynamicProperties.entries()]);
    storage.setTraits([...this.traits.keys()]);

    // Return the item stack level storage.
    return storage;
  }

  public loadLevelStorage(world: World, source: CompoundTag): void {
    // Create a new level storage for the item stack.
    const storage = new ItemStackLevelStorage(source);

    // Set the world of the item stack.
    this.world = world;

    // Copy the nbt data from the level storage to the item stack.
    this.nbt.push(...storage.getStackNbt().values());

    // Set the properties of the item stack from the level storage.
    this.setStackSize(storage.getStackSize());
    this.metadata = storage.getMetadata();

    // Iterate over the dynamic properties and set them on the item stack.
    for (const [key, value] of storage.getDynamicProperties()) {
      this.dynamicProperties.set(key, value);
    }

    // Iterate over the traits and add them to the item stack.
    for (const identifier of storage.getTraits()) {
      // Get the trait from the item type.
      const itemTrait = world.itemPalette.getTrait(identifier);

      // Check if the trait exists in the item type.
      if (!itemTrait) {
        // Log a warning to the console.
        world.logger.warn(
          `Skipping ItemStackTrait for item §u${this.identifier}§r as the trait §u${identifier}§r does not exist in the item palette.`
        );

        // Skip the trait if it does not exist.
        continue;
      }

      // Add the trait to the item stack.
      const trait = this.addTrait(itemTrait);

      // Log the loading of the trait.
      world.logger.debug(
        `Loaded ItemStackTrait §u${trait.identifier}§r for item §u${this.identifier}§r.`
      );
    }
  }

  /**
   * Converts the item stack to a network item instance descriptor.
   * Which is used on the protocol level.
   * @param item The item stack to convert.
   * @returns The network item instance descriptor.
   */
  public static toNetworkInstance(
    item: ItemStack
  ): NetworkItemInstanceDescriptor {
    // Prepare the network block id.
    let networkBlockId = 0;

    // Check if the item type is a block placer component.
    if (item.type.components.hasComponent(ItemTypeBlockPlacerComponent)) {
      // Get the block placer component from the item type.
      const blockPlacer = item.type.components.getBlockPlacer();

      // Get the block type from the block placer.
      const blockType = blockPlacer.getBlockType();

      // Get the permutation from the block type.
      const permutation = blockType.permutations[item.metadata];
      if (permutation) networkBlockId = permutation.networkId;
    }

    // Return the item instance descriptor.
    return {
      network: item.type.network,
      stackSize: item.stackSize,
      metadata: item.metadata,
      networkBlockId,
      extras: {
        nbt: item.nbt,
        canDestroy: [],
        canPlaceOn: []
      }
    };
  }

  /**
   * Converts the item stack to a network item stack descriptor.
   * Which is used on the protocol level.
   * @param item The item stack to convert.
   * @returns The network item stack descriptor.
   */
  public static toNetworkStack(item: ItemStack): NetworkItemStackDescriptor {
    // Get network item instance descriptor.
    const instance = ItemStack.toNetworkInstance(item);

    // Return the item stack descriptor.
    return {
      ...instance,
      stackNetId: null // TODO: Implement stackNetId, this is so that the server can track the item stack.
    };
  }

  /**
   * Creates a new item stack from another item stack.
   * @param other The other item stack to copy from.
   * @returns A new item stack instance with the same properties as the other item stack.
   */
  public static from(other: ItemStack): ItemStack {
    // Create a new item stack from the other item stack.
    const itemStack = new ItemStack(other.type, {
      stackSize: other.stackSize,
      metadata: other.metadata,
      world: other.world,
      storage: other.getLevelStorage()
    });

    // Return the new item stack.
    return itemStack;
  }

  /**
   * Converts a network item instance descriptor to an item stack.
   * @param descriptor The network item instance descriptor.
   * @returns The item stack.
   */
  public static fromNetworkInstance(
    descriptor: NetworkItemInstanceDescriptor
  ): ItemStack | null {
    // Get the item type from the network.
    const type = ItemType.getByNetwork(descriptor.network);

    // Check if the item type was found.
    if (!type) return null;

    // Create the item stack.
    const item = new this(type.identifier, {
      stackSize: descriptor.stackSize ?? 1,
      metadata: descriptor.metadata ?? 0
    });

    // Check if the descriptor has extras.
    if (descriptor.extras?.nbt)
      item.nbt.push(...descriptor.extras.nbt.values());

    // Return the item stack.
    return item;
  }

  public static fromLevelStorage(world: World, source: CompoundTag): ItemStack {
    // Create a new item stack from the level storage.
    const storage = new ItemStackLevelStorage(source);

    // Get the item identifier from the storage.
    const identifier = storage.getIdentifier();

    // Get the item type from the world item palette.
    const type = world.itemPalette.getType(identifier);

    // Check if the item type exists in the world item palette.
    if (!type)
      throw new Error(
        `ItemType "§u${identifier}§r" was not found in the world item palette.`
      );

    // Create a new item stack from the identifier.
    const stack = new ItemStack(type, {
      world,
      storage
    });

    // Return the item stack.
    return stack;
  }

  /**
   * Creates an empty item stack.
   * @returns The empty item stack.
   */
  public static empty(): ItemStack {
    return new ItemStack(ItemIdentifier.Air, { stackSize: 0 });
  }
}

export { ItemStack };
