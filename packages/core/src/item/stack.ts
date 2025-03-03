import {
  CompletedUsingItemPacket,
  ItemUseMethod,
  NetworkItemInstanceDescriptor,
  NetworkItemStackDescriptor
} from "@serenityjs/protocol";

import { Container } from "../container";
import { ItemIdentifier } from "../enums";
import {
  Items,
  ItemStackEntry,
  ItemStackProperties,
  ItemUseOnBlockOptions,
  ItemUseOnEntityOptions,
  ItemUseOptions,
  JSONLikeValue
} from "../types";
import { Player } from "../entity";
import { World } from "../world";
import {
  PlayerUseItemOnBlockSignal,
  PlayerUseItemOnEntitySignal,
  PlayerUseItemSignal
} from "../events";
import {
  DefaultItemStackEntry,
  DefaultItemStackProperties
} from "../constants";

import { ItemType, ItemTypeComponentCollection } from "./identity";
import { ItemTrait } from "./traits";
import { ItemStackNbtMap } from "./maps";

class ItemStack<T extends keyof Items = keyof Items> {
  /**
   * The type of the item stack.
   */
  public readonly type: ItemType<T>;

  /**
   * The identifier of the item stack.
   */
  public readonly identifier: T;

  /**
   * The dynamic properties of the item stack.
   */
  public readonly dynamicProperties = new Map<string, JSONLikeValue>();

  /**
   * The traits of the item stack.
   */
  public readonly traits = new Map<string, ItemTrait<T>>();

  /**
   * The nbt data of the item stack.
   */
  public readonly nbt = new ItemStackNbtMap(this);

  /**
   * The maximum stack size of the item stack.
   */
  public get maxAmount(): number {
    return this.type.maxAmount;
  }

  /**
   * If the item stack is stackable.
   */
  public get isStackable(): boolean {
    return this.maxAmount > 1;
  }

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
  public amount: number;

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

  public constructor(
    identifier: T | ItemIdentifier | ItemType<T>,
    properties?: Partial<ItemStackProperties>
  ) {
    // Assign the type of the item stack
    this.type =
      identifier instanceof ItemType
        ? identifier
        : (ItemType.get(identifier as T) as ItemType<T>); // TODO: Fix this, fetch from palette

    // Assign the identifier of the item stack
    this.identifier = this.type.identifier;

    // Spread the default properties and the provided properties
    const props = { ...DefaultItemStackProperties, ...properties };

    // Assign the properties to the item stack
    this.amount = props.amount;
    this.metadata = props.metadata;

    // Check if a world was provided
    if (props.world) {
      // Assign the world to the item stack
      this.world = props.world;

      // Check if a entry was provided
      if (props.entry)
        // Load the data entry for the item stack
        this.loadDataEntry(props.world, props.entry);

      // Initialize the item stack
      this.initialize();
    }

    // Add base the nbt properties to the item stack
    for (const tag of this.type.properties.getTags()) this.nbt.add(tag);
  }

  /**
   * Initializes the item stack.
   */
  public initialize(): void {
    // Get the traits for the itemstack
    const traits = this.world.itemPalette.getRegistry(this.type.identifier);

    // Register the traits to the itemstack
    for (const trait of traits) if (!this.hasTrait(trait)) this.addTrait(trait);

    // Iterate over the tags of the item type
    for (const tag of this.type.tags) {
      // Get the traits for the tag
      const traits = [...this.world.itemPalette.traits].filter(
        ([, trait]) => trait.tag === tag
      );

      // Register the traits to the itemstack
      for (const [, trait] of traits)
        if (!this.hasTrait(trait)) this.addTrait(trait);
    }

    // Iterate over the dynamic properties of the item type
    for (const key of this.type.components.entries.keys()) {
      // Get the traits for the component
      const traits = [...this.world.itemPalette.traits].filter(
        ([, trait]) => trait.component === key
      );

      // Register the traits to the itemstack
      for (const [, trait] of traits)
        if (!this.hasTrait(trait)) this.addTrait(trait);
    }
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
    if (this.amount <= 0) {
      // Remove the item from the container.
      this.container.clearSlot(slot);
    }

    // Set the item in the container.
    else this.container.setItem(slot, this);
  }

  /**
   * Set the amount of the item stack.
   * @param amount The amount to set.
   */
  public setAmount(amount: number): void {
    // Update the amount of the item stack.
    this.amount = amount;

    // Update the item in the container.
    this.update();
  }

  /**
   * Decrements the amount of the item stack.
   * @param amount The amount to decrement.
   */
  public decrement(amount?: number): void {
    this.setAmount(this.amount - (amount ?? 1));
  }

  /**
   * Increments the amount of the item stack.
   * @param amount The amount to increment.
   */
  public increment(amount?: number): void {
    this.setAmount(this.amount + (amount ?? 1));
  }

  /**
   * Causes a player to use the item stack.
   * @param player The player using the item.
   * @param options The options for the item use.
   * @returns Whether the item use was successful; default is true.
   */
  public use(player: Player, options: ItemUseOptions): boolean | ItemUseMethod {
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
    options: ItemUseOnBlockOptions
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
    options: ItemUseOnEntityOptions
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
   * Whether the itemstack has the specified trait.
   * @param trait The trait to check for
   * @returns Whether the itemstack has the trait
   */
  public hasTrait(trait: string | typeof ItemTrait<T>): boolean {
    return this.traits.has(
      typeof trait === "string" ? trait : trait.identifier
    );
  }

  /**
   * Gets the specified trait from the itemstack.
   * @param trait The trait to get from the itemstack
   * @returns The trait if it exists, otherwise null
   */
  public getTrait<K extends typeof ItemTrait<T>>(trait: K): InstanceType<K>;

  /**
   * Gets the specified trait from the itemstack.
   * @param trait The trait to get from the itemstack
   * @returns The trait if it exists, otherwise null
   */
  public getTrait(trait: string): ItemTrait<T> | null;

  /**
   * Gets the specified trait from the itemstack.
   * @param trait The trait to get from the itemstack
   * @returns The trait if it exists, otherwise null
   */
  public getTrait(trait: string | typeof ItemTrait<T>): ItemTrait<T> | null {
    return this.traits.get(
      typeof trait === "string" ? trait : trait.identifier
    ) as ItemTrait<T> | null;
  }

  /**
   * Removes the specified trait from the itemstack.
   * @param trait The trait to remove
   */
  public removeTrait(trait: string | typeof ItemTrait<T>): void {
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
  public addTrait<K extends typeof ItemTrait<T>>(
    trait: K | ItemTrait<T>,
    options?: ConstructorParameters<K>[1]
  ): InstanceType<K> {
    // Check if the trait already exists
    if (this.traits.has(trait.identifier))
      return this.getTrait(trait.identifier) as InstanceType<K>;

    // Check if the trait is in the palette
    if (this.world && !this.world.itemPalette.traits.has(trait.identifier))
      this.world.logger.warn(
        `Trait "§c${trait.identifier}§r" was added to itemstack "§d${this.type.identifier}§r" but does not exist in the palette. This may result in a deserilization error.`
      );

    // Attempt to add the trait to the itemstack
    try {
      // Check if the trait is an instance of ItemTrait
      if (trait instanceof ItemTrait) {
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
      const otherTrait = other.traits.get(identifier) as ItemTrait<T>;

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

      // // Get the snbt values of the nbt.
      const snbt = JSON.stringify(value.toJSON());
      const otherSnbt = JSON.stringify(otherValue.toJSON());

      // Check if the nbt values are equal.
      if (snbt !== otherSnbt) return false;
    }

    // Return true if the item stacks are equal.
    return true;
  }

  /**
   * Gets the data entry for the item stack.
   * @returns The data entry for the item stack.
   */
  public getDataEntry(): ItemStackEntry {
    // Create the item stack entry.
    const entry: ItemStackEntry = {
      identifier: this.type.identifier,
      amount: this.amount,
      metadata: this.metadata,
      dynamicProperties: [...this.dynamicProperties.entries()],
      traits: [...this.traits.keys()],
      nbtProperties: this.nbt.serialize().toString("base64")
    };

    // Return the item stack entry.
    return entry;
  }

  /**
   * Loads the data entry for the item stack.
   * @param world The world to load the item stack in.
   * @param entry The item stack entry to load.
   * @param overwrite Whether to overwrite the existing data.
   */
  public loadDataEntry(
    world: World,
    entry: ItemStackEntry,
    overwrite = true
  ): void {
    // Spread the default item stack entry and the provided entry
    // This will add any missing properties to the entry
    entry = { ...DefaultItemStackEntry, ...entry };

    // Check that the identifiers match.
    if (entry.identifier !== this.type.identifier)
      throw new Error(
        "Failed to load itemstack entry as the type identifier does not match!"
      );

    // Check if the entry should overwrite the existing data.
    if (overwrite) {
      // Clear the dynamic properties and traits.
      this.dynamicProperties.clear();
      this.traits.clear();
    }

    // Update the item stack properties.
    this.amount = entry.amount;
    this.metadata = entry.metadata;

    // Add the dynamic properties to the stack, if it does not already exist
    for (const [key, value] of entry.dynamicProperties) {
      if (!this.dynamicProperties.has(key))
        this.dynamicProperties.set(key, value);
    }

    // Add the traits to the itemstack, if it does not already exist
    for (const trait of entry.traits) {
      // Check if the palette has the trait
      const traitType = world.itemPalette.traits.get(trait);

      // Check if the trait exists in the palette
      if (!traitType) {
        world.logger.error(
          `Failed to load trait "${trait}" for itemstack "${this.type.identifier}" as it does not exist in the palette`
        );

        continue;
      }

      // Attempt to add the trait to the itemstack
      this.addTrait(traitType);
    }

    // Deserialize the nbt data.
    this.nbt.deserialize(Buffer.from(entry.nbtProperties, "base64"));
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
    // Get the permutation of the block.
    const permutation = item.type.blockType?.permutations[item.metadata];

    // Return the item instance descriptor.
    return {
      network: item.type.network,
      stackSize: item.amount,
      metadata: item.metadata,
      networkBlockId: permutation?.networkId ?? 0,
      extras: {
        nbt: item.nbt.toCompound(),
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
      amount: descriptor.stackSize ?? 1,
      metadata: descriptor.metadata ?? 0
    });

    // Return the item stack.
    return item;
  }

  /**
   * Creates an item stack from a data entry.
   * @param entry The data entry to create the item stack from.
   * @param world The world to create the item stack in.
   * @returns The item stack.
   */
  public static fromDataEntry(entry: ItemStackEntry, world?: World): ItemStack {
    return new this(entry.identifier as ItemIdentifier, {
      metadata: entry.metadata,
      amount: entry.amount,
      entry,
      world
    });
  }

  /**
   * Creates an empty item stack.
   * @returns The empty item stack.
   */
  public static empty(): ItemStack {
    return new ItemStack(ItemIdentifier.Air, { amount: 0 });
  }
}

export { ItemStack, DefaultItemStackProperties };
