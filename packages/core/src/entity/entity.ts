import {
  ActorFlag,
  ContainerName,
  EffectType,
  MoveActorDeltaPacket,
  MoveDeltaFlags,
  Rotation,
  SetActorMotionPacket,
  Vector3f
} from "@serenityjs/protocol";

import { Dimension, World } from "../world";
import {
  CardinalDirection,
  EntityIdentifier,
  EntityInteractMethod
} from "../enums";
import {
  CommandResponse,
  EntityEffectOptions,
  EntityEntry,
  EntityProperties,
  JSONLikeValue
} from "../types";
import { Serenity } from "../serenity";
import { Chunk } from "../world/chunk";
import { Container } from "../container";
import { ItemBundleTrait, ItemStack } from "../item";
import { CommandExecutionState } from "../commands";
import { EntityDespawnedSignal, EntitySpawnedSignal } from "../events";

import { EntityType } from "./identity";
import {
  EntityEffectsTrait,
  EntityEquipmentTrait,
  EntityHealthTrait,
  EntityInventoryTrait,
  EntityTrait
} from "./traits";
import { Player } from "./player";
import { MetadataMap, ActorFlagMap, AttributeMap } from "./maps";

class Entity {
  /**
   * The running total of entities that have been created
   */
  public static runtimeId = 0n;

  /**
   * The serenity instance of the server
   */
  protected readonly serenity: Serenity;

  /**
   * The type of the entity. (Identifier, NetworkId, etc)
   */
  public readonly type: EntityType;

  /**
   * The current runtime id of the entity. (Incremented each time an entity is created)
   */
  public readonly runtimeId = ++Entity.runtimeId;

  /**
   * The unique id of the entity. (Generated by the server, and exists for the lifetime of the entity)
   */
  public readonly uniqueId: bigint;

  /**
   * The current position of the entity
   */
  public readonly position = new Vector3f(0, 0, 0);

  /**
   * The current velocity of the entity
   */
  public readonly velocity = new Vector3f(0, 0, 0);

  /**
   * The current rotation of the entity
   */
  public readonly rotation = new Rotation(0, 0, 0);

  /**
   * The traits that are attached to the entity
   */
  public readonly traits = new Map<string, EntityTrait>();

  /**
   * The components that are attached to the entity
   */
  public readonly components = new Map<string, JSONLikeValue>();

  /**
   * The metadata that is attached to the entity
   * These values are derived from the components and traits of the entity
   */
  public readonly metadata = new MetadataMap(this);

  /**
   * The flags that are attached to the entity
   * These values are derived from the components and traits of the entity
   */
  public readonly flags = new ActorFlagMap(this);

  /**
   * The attributes that are attached to the entity
   * These values are derived from the components and traits of the entity
   */
  public readonly attributes = new AttributeMap(this);

  /**
   * The tags that are attached to the entity
   */
  public readonly tags = new Set<string>();

  /**
   * The current dimension of the entity.
   * This should not be dynamically changed, but instead use the `teleport` method.
   */
  public dimension: Dimension;

  /**
   * Whether the entity is alive or not.
   */
  public isAlive = false;

  /**
   * Whether the entity is moving or not.
   */
  public isMoving = false;

  /**
   * Whether the entity is on the ground or not.
   */
  public onGround = false;

  /**
   * Creates a new entity within a dimension.
   * @param dimension The dimension to create the entity in
   * @param type The type of the entity to create
   * @param properties Additional properties to assign to the entity
   */
  public constructor(
    dimension: Dimension,
    type: EntityType | EntityIdentifier,
    properties?: Partial<EntityProperties>
  ) {
    // Assign the serenity instance to the entity
    this.serenity = dimension.world.serenity;

    // Assign the dimension and type to the entity
    this.dimension = dimension;

    // Assign the type of the entity
    if (type instanceof EntityType) this.type = type;
    else this.type = dimension.world.entityPalette.getType(type) as EntityType;

    // Assign the properties to the entity
    // If a provided unique id is not given, generate one
    this.uniqueId = !properties?.uniqueId
      ? Entity.createUniqueId(this.type.network, this.runtimeId)
      : properties.uniqueId;

    // Set the position of the entity
    this.position.set(dimension.spawnPosition);

    // If the entity is not a player
    if (!this.isPlayer()) {
      // If the entity properties contains an entry, load it
      if (properties?.entry)
        this.loadDataEntry(this.dimension.world, properties.entry);

      // Initialize the entity
      this.initialize();
    }
  }

  protected initialize(): void {
    // Get the traits for the entity
    const traits = this.dimension.world.entityPalette.getRegistryFor(
      this.type.identifier
    );

    // Fetch the component type based traits
    for (const component of this.type.components) {
      // Prepare the identifier for the component
      let identifier = component;

      // Check if the component starts with a namespace
      if (component.includes(":")) {
        const split = component.split(":");
        identifier = split[1] as string;
      }

      // Find the trait for the component
      const trait = this.dimension.world.entityPalette.getTrait(identifier);

      // Check if the trait exists
      // If so, add it to the entity
      if (trait) traits.push(trait);
    }

    // Register the traits to the entity
    for (const trait of traits) if (!this.hasTrait(trait)) this.addTrait(trait);
  }

  /**
   * Checks if the entity is a player.
   * @returns Whether or not the entity is a player.
   */
  public isPlayer(): this is Player {
    return this.type.identifier === EntityIdentifier.Player;
  }

  /**
   * Checks if the entity is an item.
   * @returns Whether or not the entity is an item.
   */
  public isItem(): boolean {
    return this.type.identifier === EntityIdentifier.Item;
  }

  /**
   * Whether the entity is sneaking or not.
   */
  public get isSneaking(): boolean {
    return this.flags.get(ActorFlag.Sneaking) ?? false;
  }

  /**
   * Whether the entity is sprinting or not.
   */
  public get isSprinting(): boolean {
    return this.flags.get(ActorFlag.Sprinting) ?? false;
  }

  /**
   * Whether the entity is swimming or not.
   */
  public get isSwimming(): boolean {
    return this.flags.get(ActorFlag.Swimming) ?? false;
  }

  /**
   * Add's an effect to the entity.
   * @param effectType The effect type that will be applied to the entity
   * @param duration The duration of the effect in seconds.
   * @param amplifier The amplifier of the effect.
   * @param showParticles Wether or not the effect will show particles.
   * TODO: Refactor method parameters.
   */
  public addEffect(
    effectType: EffectType,
    duration: number,
    options?: EntityEffectOptions
  ): void {
    // If the entity doesn't have the effects trait, add the trait
    const effectTrait =
      this.getTrait(EntityEffectsTrait) ?? this.addTrait(EntityEffectsTrait);

    // Add the effect to the entity.
    effectTrait.add(effectType, duration * 40, options);
  }

  /**
   * Removes an effect from the entity.
   * @param effectType The effect type to remove from the entity
   */
  public removeEffect(effectType: EffectType): void {
    const effectTrait = this.getTrait(EntityEffectsTrait);
    if (!effectTrait || !effectTrait.has(effectType)) return;

    effectTrait.remove(effectType);
  }

  /**
   * Checks whether the entity has the effect or not.
   * @param effectType The effect type to check if the entity has.
   * @returns whether the entity has the effect or not.
   */
  public hasEffect(effectType: EffectType): boolean {
    const effectTrait = this.getTrait(EntityEffectsTrait);
    return effectTrait?.has(effectType) ?? false;
  }

  /**
   * Whether the entity has the specified trait.
   * @param trait The trait to check for
   * @returns Whether the entity has the trait
   */
  public hasTrait(trait: string | typeof EntityTrait): boolean {
    return this.traits.has(
      typeof trait === "string" ? trait : trait.identifier
    );
  }

  /**
   * Computes the view direction vector based on the current pitch and yaw rotations.
   *
   * @returns A Vector3f representing the direction the view is pointing.
   */
  public getViewDirection(): Vector3f {
    // Convert pitch and yaw angles from degrees to radians
    const pitchRadians = this.rotation.pitch * (Math.PI / 180);
    const yawRadians = -this.rotation.headYaw * (Math.PI / 180); // Invert yaw for correct orientation

    // Calculate the direction vector components
    return new Vector3f(
      Math.sin(yawRadians) * Math.cos(pitchRadians), // X component of the view vector
      -Math.sin(pitchRadians), // Y component of the view vector (negative for correct orientation)
      Math.cos(yawRadians) * Math.cos(pitchRadians) // Z component of the view vector
    );
  }

  /**
   * Gets the specified trait from the entity.
   * @param trait The trait to get from the entity
   * @returns The trait if it exists, otherwise null
   */
  public getTrait<T extends typeof EntityTrait>(trait: T): InstanceType<T>;

  /**
   * Gets the specified trait from the entity.
   * @param trait The trait to get from the entity
   * @returns The trait if it exists, otherwise null
   */
  public getTrait(trait: string): EntityTrait | null;

  /**
   * Gets the specified trait from the entity.
   * @param trait The trait to get from the entity
   * @returns The trait if it exists, otherwise null
   */
  public getTrait(trait: string | typeof EntityTrait): EntityTrait | null {
    return this.traits.get(
      typeof trait === "string" ? trait : trait.identifier
    ) as EntityTrait | null;
  }

  /**
   * Removes the specified trait from the entity.
   * @param trait The trait to remove
   */
  public removeTrait(trait: string | typeof EntityTrait): void {
    this.traits.delete(typeof trait === "string" ? trait : trait.identifier);
  }

  /**
   * Adds a trait to the entity.
   * @param trait The trait to add
   * @returns The trait that was added
   */
  public addTrait<T extends typeof EntityTrait>(trait: T): InstanceType<T> {
    // Check if the trait already exists
    if (this.traits.has(trait.identifier)) return this.getTrait<T>(trait);

    // Check if the trait is in the palette
    if (!this.getWorld().entityPalette.traits.has(trait.identifier))
      this.getWorld().logger.warn(
        `Trait "§c${trait.identifier}§r" was added to entity "§d${this.type.identifier}§r:§d${this.uniqueId}§r" in dimension "§a${this.dimension.identifier}§r" but does not exist in the palette. This may result in a deserilization error.`
      );

    // Attempt to add the trait to the entity
    try {
      // Create a new instance of the trait
      return new trait(this) as InstanceType<T>;
    } catch (reason) {
      // Log the error to the console
      this.serenity.logger.error(
        `Failed to add trait "${trait.identifier}" to entity "${this.type.identifier}:${this.uniqueId}" in dimension "${this.dimension.identifier}"`,
        reason
      );

      // Return null as the trait was not added
      return null as InstanceType<T>;
    }
  }

  /**
   * Gets the world the entity is currently in.
   * @returns The world the entity is in
   */
  public getWorld(): World {
    return this.dimension.world;
  }

  /**
   * Gets the chunk the entity is currently in.
   * @returns The chunk the entity is in
   */
  public getChunk(): Chunk {
    // Convert the position to a chunk position
    const cx = this.position.x >> 4;
    const cz = this.position.z >> 4;

    // Get the chunk from the dimension
    return this.dimension.getChunk(cx, cz);
  }

  /**
   * Gets the item the entity is currently holding.
   * @returns The item the entity is holding
   */
  public getHeldItem(): ItemStack | null {
    // Check if the entity has an inventory trait
    if (!this.hasTrait(EntityInventoryTrait)) return null;

    // Get the inventory trait
    const inventory = this.getTrait(EntityInventoryTrait);

    // Return the held item
    return inventory.getHeldItem();
  }

  /**
   * Gets the cardinal direction of the entity.
   * @returns The cardinal direction of the entity.
   */
  public getCardinalDirection(): CardinalDirection {
    // Calculate the cardinal direction of the entity
    // Entity yaw is -180 to 180

    // Calculate the rotation of the entity
    const rotation = (Math.floor(this.rotation.yaw) + 360) % 360;

    // Calculate the cardinal direction
    if (rotation >= 315 || rotation < 45) return CardinalDirection.South;
    if (rotation >= 45 && rotation < 135) return CardinalDirection.West;
    if (rotation >= 135 && rotation < 225) return CardinalDirection.North;
    if (rotation >= 225 && rotation < 315) return CardinalDirection.East;

    return CardinalDirection.South;
  }

  /**
   * Spawns the entity into the dimension.
   */
  public spawn(): this {
    // Create a new EntitySpawnedSignal
    const signal = new EntitySpawnedSignal(this, this.dimension).emit();

    // Check if the signal was cancelled
    if (!signal) return this;

    // Add the entity to the dimension
    this.dimension.entities.set(this.uniqueId, this);

    // Set the entity as alive
    this.isAlive = true;

    // Trigger the entity onSpawn trait event
    for (const trait of this.traits.values()) {
      // Attempt to trigger the onSpawn trait event
      try {
        // Call the onSpawn trait event
        trait.onSpawn?.();
      } catch (reason) {
        // Log the error to the console
        this.serenity.logger.error(
          `Failed to trigger onSpawn trait event for entity "${this.type.identifier}:${this.uniqueId}" in dimension "${this.dimension.identifier}"`,
          reason
        );

        // Remove the trait from the entity
        this.traits.delete(trait.identifier);
      }
    }

    // Update the entity actor data & attributes
    this.metadata.update();
    this.attributes.update();

    // Return the entity
    return this;
  }

  /**
   * Despawns the entity from the dimension.
   */
  public despawn(): this {
    // Create a new EntityDespawnedSignal
    const signal = new EntityDespawnedSignal(this, this.dimension).emit();

    // Check if the signal was cancelled
    if (!signal) return this;

    // Set the entity as not alive
    this.isAlive = false;

    // Remove the entity from the dimension
    this.dimension.entities.delete(this.uniqueId);

    // Trigger the entity onDespawn trait event
    for (const trait of this.traits.values()) {
      // Attempt to trigger the onDespawn trait event
      try {
        // Call the onDespawn trait event
        trait.onDespawn?.();
      } catch (reason) {
        // Log the error to the console
        this.serenity.logger.error(
          `Failed to trigger onDespawn trait event for entity "${this.type.identifier}:${this.uniqueId}" in dimension "${this.dimension.identifier}"`,
          reason
        );

        // Remove the trait from the entity
        this.traits.delete(trait.identifier);
      }
    }

    // Return the entity
    return this;
  }

  /**
   * Kills the entity.
   */
  public kill(): void {
    // Set the entity as not alive
    this.isAlive = false;

    // Check if the entity has an inventory trait
    if (this.hasTrait(EntityInventoryTrait)) {
      // Get the inventory trait
      const { container, inventorySize } = this.getTrait(EntityInventoryTrait);

      // Iterate over the inventory slots
      for (let slot = 0; slot < inventorySize; slot++) {
        // Get the item from the slot
        const item = container.getItem(slot);

        // Check if the item is valid
        if (!item) continue;

        // Spawn the item in the dimension
        this.dimension.spawnItem(item, this.position);

        // Clear the slot
        container.clearSlot(slot);
      }
    }

    // Check if the entity has a health trait
    if (this.hasTrait(EntityHealthTrait)) {
      // Get the health trait
      const health = this.getTrait(EntityHealthTrait);

      // Set the health to minimum value
      health.currentValue = health.effectiveMin;
    }

    // Schedule the entity to despawn
    this.dimension.schedule(50).on(() => {
      // If the entity is not a player, despawn the entity
      if (!this.isPlayer()) this.despawn();
      // Manually trigger the onDespawn trait event for players
      // We does this because the player has the option to disconnect at the respawn screen
      else for (const trait of this.traits.values()) trait.onDespawn?.();
    });
  }

  /**
   * Causes a player to interact with the entity.
   * @param player The player that is interacting with the entity.
   * @param method The method that the player used to interact with the entity.
   */
  public interact(player: Player, method: EntityInteractMethod): void {
    // Trigger the entity onInteract trait event
    for (const trait of this.traits.values()) {
      // Attempt to trigger the onInteract trait event
      try {
        // Call the onInteract trait event
        trait.onInteract?.(player, method);
      } catch (reason) {
        // Log the error to the console
        this.serenity.logger.error(
          `Failed to trigger onInteract trait event for entity "${this.type.identifier}:${this.uniqueId}" in dimension "${this.dimension.identifier}"`,
          reason
        );

        // Remove the trait from the entity
        this.traits.delete(trait.identifier);
      }
    }
  }

  /**
   * Get a container from the entity.
   * @param name The name of the container.
   */
  public getContainer(
    name: ContainerName,
    dynamicId?: number
  ): Container | null {
    // Check if a dynamic id was provided
    if (dynamicId) {
      // Check if the entity has an inventory trait
      if (!this.hasTrait(EntityInventoryTrait)) return null;

      // Get the inventory trait
      const { container } = this.getTrait(EntityInventoryTrait);

      // Iterate over the items in the container
      for (const item of container.storage) {
        // Check if the item is valid
        if (!item) continue;

        // Check if the item has a ItemBundleTrait
        if (item.hasTrait(ItemBundleTrait)) {
          // Get the bundle trait
          const bundle = item.getTrait(ItemBundleTrait);

          // Check if the bundle has the dynamic id
          if (bundle.dynamicId === dynamicId) return bundle.container;
        }
      }
    }

    // Switch name of the container
    switch (name) {
      default: {
        // Return null if the container name is not valid
        return null;
      }

      // case ContainerName.Armor: {
      //   // Check if the entity has an inventory component
      //   if (!this.hasComponent("minecraft:inventory"))
      //     throw new Error("The entity does not have an inventory component.");

      //   // Get the inventory component
      //   const inventory = this.getComponent("minecraft:inventory");

      //   // Return the armor container
      //   return inventory.container;
      // }

      case ContainerName.Armor: {
        if (!this.hasTrait(EntityEquipmentTrait))
          throw new Error("The player does not have an equipment trait.");

        // Get the equipment trait
        const equipment = this.getTrait(EntityEquipmentTrait);

        // Return the equipment container
        return equipment.container;
      }

      case ContainerName.Hotbar:
      case ContainerName.Inventory:
      case ContainerName.HotbarAndInventory: {
        // Check if the entity has an inventory trait
        if (!this.hasTrait(EntityInventoryTrait))
          throw new Error("The entity does not have an inventory trait.");

        // Get the inventory trait
        const inventory = this.getTrait(EntityInventoryTrait);

        // Return the inventory container
        return inventory.container;
      }
    }
  }

  /**
   * Sets the position of the entity.
   * @param vector The position to set.
   */
  public setMotion(vector?: Vector3f): void {
    // Update the velocity of the entity
    this.velocity.x = vector?.x ?? this.velocity.x;
    this.velocity.y = vector?.y ?? this.velocity.y;
    this.velocity.z = vector?.z ?? this.velocity.z;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.position.z += this.velocity.z;

    // Set the onGround property of the entity
    this.onGround = false;

    // Create a new SetActorMotionPacket
    const packet = new SetActorMotionPacket();

    // Set the properties of the packet
    packet.runtimeId = this.runtimeId;
    packet.motion = this.velocity;
    packet.inputTick = this.isPlayer()
      ? this.inputTick
      : this.dimension.world.currentTick;

    // Broadcast the packet to the dimension
    this.dimension.broadcast(packet);
  }

  /**
   * Adds motion to the entity.
   * @param vector The motion to add.
   */
  public addMotion(vector: Vector3f): void {
    // Update the velocity of the entity
    this.velocity.x += vector.x;
    this.velocity.y += vector.y;
    this.velocity.z += vector.z;

    // Set the motion of the entity
    this.setMotion();
  }

  /**
   * Clears the motion of the entity.
   */
  public clearMotion(): void {
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.z = 0;

    // Set the motion of the entity
    this.setMotion();
  }

  /**
   * Applies an impulse to the entity.
   * @param vector The impulse to apply.
   */
  public applyImpulse(vector: Vector3f): void {
    // Update the velocity of the entity
    this.velocity.x += vector.x;
    this.velocity.y += vector.y;
    this.velocity.z += vector.z;

    // Set the motion of the entity
    this.setMotion();
  }

  public teleport(position: Vector3f, dimension?: Dimension): void {
    // Set the position of the entity
    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;

    // Check if a dimension was provided
    if (dimension) {
      // Despawn the entity from the current dimension
      this.despawn();

      // Set the dimension of the entity
      this.dimension = dimension;

      // Spawn the entity in the new dimension
      this.spawn();
    } else {
      // Create a new MoveActorDeltaPacket
      const packet = new MoveActorDeltaPacket();

      // Assign the packet properties
      packet.runtimeId = this.runtimeId;
      packet.flags = MoveDeltaFlags.All;
      packet.x = this.position.x;
      packet.y = this.position.y;
      packet.z = this.position.z;
      packet.yaw = this.rotation.yaw;
      packet.headYaw = this.rotation.headYaw;
      packet.pitch = this.rotation.pitch;

      // Check if the entity is on the ground
      if (this.onGround) packet.flags |= MoveDeltaFlags.OnGround;

      // Broadcast the packet to the dimension
      this.dimension.broadcast(packet);
    }
  }

  /**
   * Gets the selected inventory slot of the entity.
   * @returns The selected hotbar index of the entity.
   */
  public getSelectedSlot(): number {
    // Check if the entity has an inventory trait
    if (!this.hasTrait(EntityInventoryTrait))
      throw new Error("The entity does not have an inventory trait.");

    // Get the inventory trait
    const inventory = this.getTrait(EntityInventoryTrait);

    // Return the selected slot
    return inventory.selectedSlot;
  }

  /**
   * Forces the entity to drop an item from its inventory.
   * @param slot The slot to drop the item from.
   * @param amount The amount of items to drop.
   * @param container The container to drop the item from.
   * @returns Whether or not the item was dropped.
   */
  public dropItem(slot: number, amount: number, container: Container): boolean {
    // Check if the entity has an inventory trait
    if (!this.hasTrait(EntityInventoryTrait)) return false;

    // Get the item from the slot
    const item = container.takeItem(slot, amount);

    // Check if the item is valid
    if (!item) return false;

    // Get the entity's position and rotation
    const { x, y, z } = this.position;
    const { headYaw, pitch } = this.rotation;

    // Normalize the pitch & headYaw, so the entity will be spawned in the correct direction
    const headYawRad = (headYaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;

    // Calculate the velocity of the entity based on the entity's rotation
    const velocity = new Vector3f(
      (-Math.sin(headYawRad) * Math.cos(pitchRad)) / 3 / 0.5,
      (-Math.sin(pitchRad) / 2) * 0.75,
      (Math.cos(headYawRad) * Math.cos(pitchRad)) / 3 / 0.5
    );

    // Spawn the entity
    const entity = this.dimension.spawnItem(item, new Vector3f(x, y - 0.25, z));

    // Set the velocity of the entity
    entity.addMotion(velocity);

    // Return true as the item was dropped
    return true;
  }

  /**
   * Whether or not the entity has a tag.
   * @param tag The tag to check.
   * @returns Whether or not the entity has the tag.
   */
  public hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  /**
   * Gets the tags of the entity.
   * @returns The tags of the entity.
   */
  public getTags(): Array<string> {
    return [...this.tags];
  }

  /**
   * Adds a tag to the entity.
   * @param tag The tag to add.
   * @returns Whether or not the tag was added.
   */
  public addTag(tag: string): boolean {
    // Check if the tag already exists
    if (this.tags.has(tag)) return false;

    // Tags are read-only
    this.tags.add(tag);

    // Return true as the tag was added
    return true;
  }

  /**
   * Removes a tag from the entity.
   * @param tag The tag to remove.
   * @returns Whether or not the tag was removed.
   */
  public removeTag(tag: string): boolean {
    // Check if the tag exists
    if (!this.tags.has(tag)) return false;

    // Remove the tag from the entity
    this.tags.delete(tag);

    // Return true as the tag was removed
    return true;
  }

  /**
   * Executes a command as the entity.
   * @param command The command to execute.
   * @returns The response of the command.
   */
  public executeCommand<T = unknown>(command: string): CommandResponse<T> {
    // Check if the command starts with a slash, remove it if it does not
    if (command.startsWith("/")) command = command.slice(1);

    // Create a new command execute state
    const state = new CommandExecutionState(
      this.getWorld().commands.getAll(),
      command,
      this
    );

    // Execute the command state
    return state.execute() as CommandResponse<T>;
  }

  /**
   * Gets the entity's data as a database entry.
   * @returns The entity entry object.
   */
  public getDataEntry(): EntityEntry {
    // Create the entity entry to save
    const entry: EntityEntry = {
      uniqueId: this.uniqueId,
      identifier: this.type.identifier,
      position: this.position,
      rotation: this.rotation,
      components: [...this.components.entries()],
      traits: [...this.traits.keys()],
      metadata: [...this.metadata.entries()],
      flags: [...this.flags.entries()],
      attributes: [...this.attributes.entries()]
    };

    // Return the entity entry
    return entry;
  }

  /**
   * Loads the entity from the provided entity entry.
   * @param world The world to the entity data is coming from
   * @param entry The entity entry to load
   * @param overwrite Whether to overwrite the current entity data; default is true
   */
  public loadDataEntry(
    world: World,
    entry: EntityEntry,
    overwrite = true
  ): void {
    // Check that the unique id matches the entity's unique id
    if (entry.uniqueId !== this.uniqueId)
      throw new Error(
        "Failed to load entity entry as the unique id does not match the entity's unique id!"
      );

    // Check that the identifier matches the entity's identifier
    if (entry.identifier !== this.type.identifier)
      throw new Error(
        "Failed to load entity entry as the identifier does not match the entity's identifier!"
      );

    // Set the entity's position and rotation
    this.position.set(entry.position);
    this.rotation.set(entry.rotation);

    // Check if the entity should overwrite the current data
    if (overwrite) {
      this.components.clear();
      this.traits.clear();
    }

    // Add the components to the entity, if it does not already exist
    for (const [key, value] of entry.components) {
      if (!this.components.has(key)) this.components.set(key, value);
    }

    // Add the traits to the entity, if it does not already exist
    for (const trait of entry.traits) {
      // Check if the palette has the trait
      const traitType = world.entityPalette.traits.get(trait);

      // Check if the trait exists in the palette
      if (!traitType) {
        world.logger.error(
          `Failed to load trait "${trait}" for entity "${this.type.identifier}:${this.uniqueId}" as it does not exist in the palette`
        );

        continue;
      }

      // Attempt to add the trait to the entity
      this.addTrait(traitType);
    }

    // Add the metadata to the entity, if it does not already exist
    for (const [key, value] of entry.metadata) {
      if (!this.metadata.has(key)) this.metadata.set(key, value);
    }

    // Add the flags to the entity, if it does not already exist
    for (const [key, value] of entry.flags) {
      if (!this.flags.has(key)) this.flags.set(key, value);
    }

    // Add the attributes to the entity, if it does not already exist
    for (const [key, value] of entry.attributes) {
      if (!this.attributes.has(key)) this.attributes.set(key, value);
    }
  }

  /**
   * Creates a new unique id for the entity.
   * @param network The network id of the entity type
   * @param runtimeId The current runtime id of the entity
   * @returns A generated unique id for the entity
   */
  public static createUniqueId(network: number, runtimeId: bigint): bigint {
    // Generate a unique id for the entity
    const unique = BigInt(Math.abs(Date.now() >> 4) & 0x1_ff);

    return BigInt(network << 19) | (unique << 10n) | runtimeId;
  }
}

export { Entity };
