import { IntTag } from "@serenityjs/nbt";
import {
  Enchantment,
  Gamemode,
  ItemUseMethod,
  LevelSoundEvent,
  LevelSoundEventPacket
} from "@serenityjs/protocol";

import { ItemTypeToolTier } from "../../enums";
import {
  ItemTypeDurabilityComponent,
  ItemTypeDurabilityDamageChance
} from "../identity";
import { ItemStackDamagedSignal } from "../../events";

import { ItemStackEnchantableTrait } from "./enchantable";
import { ItemStackTrait } from "./trait";

import type { ItemStack } from "../stack";
import type { Entity, Player } from "../../entity";
import type {
  ItemStackUseOnEntityOptions,
  ItemStackUseOptions
} from "../types";

class ItemStackDurabilityTrait extends ItemStackTrait {
  public static readonly identifier = "durability";
  public static readonly tag = ["minecraft:is_tool", "minecraft:is_armor"];
  public static readonly component = ItemTypeDurabilityComponent;

  /**
   * Creates a new instance of the item durability trait.
   * @param item The item stack that this trait will be attached to.
   */
  public constructor(item: ItemStack) {
    super(item);
  }

  /**
   * Get the current damage of the item stack.
   * @returns The current damage of the item stack.
   */
  public getDamage(): number {
    // Get the Damage tag from the item stack's NBT
    const damage = this.item.nbt.get<IntTag>("Damage");

    // Return the damage value if it exists; otherwise, 0
    return damage?.valueOf() ?? 0;
  }

  /**
   * Set the current damage of the item stack.
   * @param value The new damage value to set for the item stack.
   */
  public setDamage(value: number): void {
    // Set the Damage tag on the item stack's NBT
    this.item.nbt.add(new IntTag(value, "Damage"));
  }
  /**
   * Get the maximum chance that this item would be damaged using the damageRange property, given an unbreaking enchantment level.
   * @returns The damage chance of the item stack.
   */
  public getDamageChance(unbreakingEnchantmentLevel: number = 0): number {
    // Prepare the base chance variable
    let baseChance: number;

    // Check if the item has a durability component
    if (this.item.hasComponent(ItemTypeDurabilityComponent)) {
      // Get the durability component from the item type
      const component = this.item.getComponent(ItemTypeDurabilityComponent);

      // Get the damage chance from the component
      const { max, min } = component.getDamageChance();

      // Chance should be a float between 0 and 1
      baseChance = (Math.random() * (max - min) + min) / 10;
    } else {
      // If no durability component is set, return a default damage chance
      baseChance = 1;
    }

    // Calculate the final damage chance based on the unbreaking enchantment level
    const finalChance =
      baseChance /
      (Math.floor(Math.random() * (unbreakingEnchantmentLevel + 1)) + 1);

    // Return the final damage chance
    return finalChance;
  }

  /**
   * Get the damage chance range of the item stack.
   * @note This value is determined by the item's durability component.
   * @returns The damage chance range of the item stack.
   */
  public getDamageChanceRange(): ItemTypeDurabilityDamageChance {
    // Check if the item has a durability component
    if (this.item.hasComponent(ItemTypeDurabilityComponent)) {
      // Get the durability component from the item type
      const component = this.item.getComponent(ItemTypeDurabilityComponent);

      // Return the damage chance from the component
      return component.getDamageChance();
    } else {
      // If no durability component is set, return a default damage chance range
      return { max: 1, min: 1 };
    }
  }

  /**
   * Get the maximum durability of the item stack.
   * @returns The maximum durability of the item stack.
   */
  public getMaxDurability(): number {
    // Check if the item has a durability component
    if (this.item.hasComponent(ItemTypeDurabilityComponent)) {
      // Get the durability component from the item type
      const component = this.item.getComponent(ItemTypeDurabilityComponent);

      // Return the maximum durability from the component
      return component.getMaxDurability();
    } else {
      // Check for vanilla tool tiers and return the max durability
      switch (this.item.type.getToolTier()) {
        default:
        case ItemTypeToolTier.None:
          return 25; // Default durability if no tier is set
        case ItemTypeToolTier.Wooden:
          return 59;
        case ItemTypeToolTier.Stone:
          return 131;
        case ItemTypeToolTier.Copper:
          return 196;
        case ItemTypeToolTier.Iron:
          return 250;
        case ItemTypeToolTier.Golden:
          return 32;
        case ItemTypeToolTier.Diamond:
          return 1561;
        case ItemTypeToolTier.Netherite:
          return 2031;
      }
    }
  }

  public onAdd(): void {
    // Check if the item has the Damage tag
    if (!this.item.nbt.has("Damage")) {
      // Create the Damage tag with an initial value of 0
      const damage = new IntTag(0, "Damage");

      // Set the Damage tag on the item stack's NBT
      this.item.nbt.add(damage);
    }
  }

  public onRemove(): void {
    // Remove the Damage tag from the item stack's NBT
    this.item.nbt.delete("Damage");
  }

  public onUseOnEntity(
    player: Player,
    options: ItemStackUseOnEntityOptions
  ): void | boolean {
    // Check if the use method is not canceled and is a tool use
    if (options.canceled || options.method !== ItemUseMethod.Attack) return;

    // Check if the player is in creative mode
    if (player.getGamemode() === Gamemode.Creative) return;

    // Process the damage for the item stack
    return this.processDamage(player);
  }

  public onUse(
    player: Player,
    options: Partial<ItemStackUseOptions>
  ): void | boolean {
    // Check if the use method is not canceled and is a tool use
    if (options.canceled || options.method !== ItemUseMethod.UseTool) return;

    // Check if the player is in creative mode
    if (player.getGamemode() === Gamemode.Creative) return;

    // Process the damage for the item stack
    return this.processDamage(player);
  }

  /**
   * Process the damage for the item stack.
   * @param entity The entity that owns the item stack.
   */
  public processDamage(entity: Entity): void | boolean {
    // Get the current damage of the item stack
    const currentDamage = this.getDamage();

    // Prepare a variable for the unbreaking level
    let unbreakingLevel = 0;

    // Check if the item stack has an enchantable trait
    if (this.item.hasTrait(ItemStackEnchantableTrait)) {
      // Get the unbreaking level from the enchantable trait
      const trait = this.item.getTrait(ItemStackEnchantableTrait);

      // Set the unbreaking level from the enchantment, defaulting to 0 if not found
      unbreakingLevel = trait.getEnchantment(Enchantment.Unbreaking) ?? 0;
    }

    // Get the damage chance for the item stack using the unbreaking level
    const damageChance = this.getDamageChance(unbreakingLevel);

    // Determine if the item should lose durability
    if (Math.random() < damageChance) {
      // Create a new ItemStackDamagedSignal
      const signal = new ItemStackDamagedSignal(this.item, this.getDamage(), 1);

      // Emit the signal to notify that the item stack was damaged
      const success = signal.emit();

      // Check if the signal was canceled
      if (!success) return false;

      // Increment the current damage by the damage dealt
      const newDamage = currentDamage + signal.durbabilityDamageDealt;

      // Set the new damage value on the item stack
      this.setDamage(newDamage);
    }

    // Check if the item stack has reached its maximum durability
    if (this.getDamage() >= this.getMaxDurability()) {
      // Create a new LevelSoundEventPacket for the item stack breaking
      const packet = new LevelSoundEventPacket();
      packet.event = LevelSoundEvent.Break;
      packet.position = entity.position;
      packet.actorIdentifier = this.item.identifier;
      packet.data = -1;
      packet.isBabyMob = false;
      packet.isGlobal = false;
      packet.uniqueActorId = -1n;

      // Broadcast the sound event packet to the entity's dimension
      entity.dimension.broadcast(packet);

      // Decrement the item stack's amount
      this.item.decrementStack();

      // Check if the item stack is empty after decrementing
      if (this.item.getStackSize() > 0) this.setDamage(0); // Reset damage if still usable
    }
  }
}

export { ItemStackDurabilityTrait };
