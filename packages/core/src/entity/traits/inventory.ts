import {
  ActorDataId,
  ActorDataType,
  ContainerId,
  ContainerType,
  MobEquipmentPacket,
  NetworkItemStackDescriptor,
  Vector3f
} from "@serenityjs/protocol";
import { CompoundTag, IntTag, ListTag } from "@serenityjs/nbt";

import { EntityIdentifier, EntityInteractMethod } from "../../enums";
import { EntityContainer } from "../container";
import { Entity } from "../entity";
import { ItemStackKeepOnDieTrait, ItemStack } from "../../item";
import { EntityInventoryTraitOptions } from "../../types";
import { Container } from "../../container";
import { Player } from "../player";

import { EntityTrait } from "./trait";

class EntityInventoryTrait extends EntityTrait {
  public static readonly identifier = "inventory";
  public static readonly types = [EntityIdentifier.Player];
  public static readonly components = ["minecraft:inventory"];

  /**
   * The container that holds the inventory items.
   */
  public readonly container: EntityContainer;

  /**
   * The selected slot in the inventory.
   */
  public selectedSlot: number = 0;

  /**
   * Whether the container is opened or not.
   */
  public opened = false;

  /**
   * Creates a new entity inventory trait.
   * @param entity The entity that this trait will be attached to.
   */
  public constructor(
    entity: Entity,
    options?: Partial<EntityInventoryTraitOptions>
  ) {
    super(entity);

    // Create a new entity container
    this.container = new EntityContainer(
      entity,
      // Determine the container type
      entity.isPlayer()
        ? ContainerType.Inventory
        : (options?.type ?? ContainerType.Container),
      // Determine the container identifier
      entity.isPlayer()
        ? ContainerId.Inventory
        : (options?.identifier ?? ContainerId.None),
      // Determine the container size
      entity.isPlayer() ? 36 : (options?.size ?? 27)
    );
  }

  /**
   * Gets the held item in the inventory.
   * @returns The held item in the inventory.
   */
  public getHeldItem(): ItemStack | null {
    return this.container.getItem(this.selectedSlot);
  }

  /**
   * Sets the held item in the inventory.
   * @param slot The slot to set the held item to.
   */
  public setHeldItem(slot: number): void {
    // Check if the entity is not a player
    if (!this.entity.isPlayer()) return;

    // Create a new MobEquipmentPacket
    const packet = new MobEquipmentPacket();

    // Get the held item from the inventory
    const heldItem = this.getHeldItem();

    // Create a new item descriptor from the held item
    const itemDescriptor = heldItem
      ? ItemStack.toNetworkStack(heldItem)
      : new NetworkItemStackDescriptor(0);

    // Assign the packet properties
    packet.runtimeEntityId = this.entity.runtimeId;
    packet.containerId = this.container.identifier;
    packet.selectedSlot = slot;
    packet.slot = slot;
    packet.item = itemDescriptor;

    // Set the selected slot to the slot
    this.selectedSlot = slot;

    // Send the packet to the player
    this.entity.send(packet);
  }

  /**
   * Called when the container is opened.
   */
  public onOpen(): void {}

  /**
   * Called when the container is closed.
   */
  public onClose(): void {}

  public onTick(): void {
    // Check if the container has occupants and the entity is not opened
    if (!this.opened && this.container.occupants.size > 0) {
      // Set the enity state to open
      this.opened = true;

      // Call the onOpen method
      this.onOpen();
    }

    // Check if the container has no occupants
    if (this.opened && this.container.occupants.size === 0) {
      // Set the entity state to closed
      this.opened = false;

      // Call the onClose method
      this.onClose();
    }
  }

  public onContainerUpdate(container: Container): void {
    // Check if the container is not the inventory container
    if (container !== this.container) return;

    // Create a new items list tag
    const items = new ListTag<CompoundTag>();

    // Iterate over the container slots
    for (let i = 0; i < this.container.size; i++) {
      // Get the item stack at the index
      const itemStack = this.container.getItem(i);

      // Check if the item is null
      if (!itemStack) continue;

      // Get the item stack level storage
      const storage = itemStack.getLevelStorage();

      // Create a new int tag for the slot
      storage.add(new IntTag(i, "Slot"));

      // Add the item stack storage to the items list tag
      items.push(storage);
    }

    // Add the items to the items list tag
    this.entity.setStorageEntry("Items", items);
  }

  public onSpawn(): void {
    // Check if the entity is a player, if so update the container
    if (this.entity.isPlayer()) this.container.update(this.entity);
  }

  public onAdd(): void {
    // Check if the entity has an items nbt property
    if (this.entity.hasStorageEntry("Items")) {
      // Get the items tag from the entity's nbt
      const items = this.entity.getStorageEntry<ListTag<CompoundTag>>("Items");

      // Get the world from the entity
      const world = this.entity.world;

      // Iterate over each item in the items list
      for (const storage of items?.values() ?? []) {
        try {
          // Create a new item stack from the level storage
          const itemStack = ItemStack.fromLevelStorage(world, storage);

          // Get the slot from the storage
          const slot = storage.get<IntTag>("Slot")?.valueOf() ?? 0;

          // Set the item stack to the container
          this.container.setItem(slot, itemStack);
        } catch (reason) {
          // Get the position of the entity
          const { x, y, z } = this.entity.position.floor();

          // Create a new error message
          const message = (reason as Error).message || "Unknown error";

          // Log an error if the item stack creation fails
          world.logger.warn(
            `Skipping ItemStack for entity container §u${this.entity.identifier}§r @ §7(§u${x}§7, §u${y}§7, §u${z}§7)§r, as ${message}§r`
          );
        }
      }
    } else {
      // Create a new items list tag
      const items = new ListTag<CompoundTag>([], "Items");

      // Push the items to the entity's nbt
      this.entity.addStorageEntry(items);
    }

    // Set the container type metadata
    this.entity.metadata.setActorMetadata(
      ActorDataId.ContainerType,
      ActorDataType.Byte,
      this.container.type
    );

    // Set the container size metadata
    this.entity.metadata.setActorMetadata(
      ActorDataId.ContainerSize,
      ActorDataType.Int,
      this.container.size
    );
  }

  public onRemove(): void {
    // Remove the container metadata
    this.entity.metadata.setActorMetadata(ActorDataId.ContainerType, null);
    this.entity.metadata.setActorMetadata(ActorDataId.ContainerSize, null);
  }

  public onInteract(player: Player, method: EntityInteractMethod): void {
    // Check if the method is not interact
    if (method !== EntityInteractMethod.Interact) return;

    // Check if the entity is a player, if so return
    if (this.entity.isPlayer()) return;

    // Show the inventory to the player
    this.container.show(player);
  }

  public onDeath(): void {
    // Check if the entity is a player, and the keep inventory gamerule is enabled
    if (this.entity.isPlayer() && this.entity.world.gamerules.keepInventory)
      return;

    // Iterate over the container slots
    for (let slot = 0; slot < this.container.size; slot++) {
      // Get the item stack at the index
      const itemStack = this.container.getItem(slot);

      // Check if the item is null
      if (!itemStack || itemStack.hasTrait(ItemStackKeepOnDieTrait)) continue;

      // Drop the item stack from the armor container
      const entity = this.dimension.spawnItem(itemStack, this.entity.position);

      // Generate a random motion vector
      const vx = Math.random() * 0.6 - 0.35;
      const vy = Math.random() * 0.35;
      const vz = Math.random() * 0.6 - 0.35;

      // Set the item stack motion vector
      entity.setMotion(new Vector3f(vx, vy, vz));

      // Clear the item stack from the armor container
      this.container.clearSlot(slot);
    }
  }
}

export { EntityInventoryTrait };
