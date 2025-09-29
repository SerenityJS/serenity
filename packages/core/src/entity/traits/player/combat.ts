import {
  AbilityIndex,
  ActorDamageCause,
  AnimatePacket,
  Vector3f,
  AnimateId,
  Gamemode
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { ItemStackWeaponTrait } from "../../../item";
import { PlayerCombatProperty } from "../../../types";
import { Entity } from "../../entity";
import { EntityHealthTrait } from "../attribute";
import { EntityEquipmentTrait } from "../equipment";

import { PlayerTrait } from "./trait";

class PlayerCombatTrait extends PlayerTrait {
  public static readonly identifier = "combat";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * The combat property data for the player.
   */
  public get property(): PlayerCombatProperty {
    return this.player
      .getStorage()
      .getDynamicProperty(PlayerCombatTrait.identifier) as PlayerCombatProperty;
  }

  /**
   * The maximum reach of the player horizontally.
   */
  public get horizontalMaxReach(): number {
    return this.property.horizontalMaxReach;
  }

  /**
   * The maximum reach of the player horizontally.
   */
  public set horizontalMaxReach(value: number) {
    this.property.horizontalMaxReach = value;
  }

  /**
   * The maximum reach of the player vertically.
   */
  public get verticalMaxReach(): number {
    return this.property.verticalMaxReach;
  }

  /**
   * The maximum reach of the player vertically.
   */
  public set verticalMaxReach(value: number) {
    this.property.verticalMaxReach = value;
  }

  /**
   * The horizontal knockback of the player.
   */
  public get horizontalKnockback(): number {
    return this.property.horizontalKnockback;
  }

  /**
   * The horizontal knockback of the player.
   */
  public set horizontalKnockback(value: number) {
    this.property.horizontalKnockback = value;
  }

  /**
   * The vertical knockback of the player.
   */
  public get verticalKnockback(): number {
    return this.property.verticalKnockback;
  }

  /**
   * The vertical knockback of the player.
   */
  public set verticalKnockback(value: number) {
    this.property.verticalKnockback = value;
  }

  /**
   * The amount of ticks till the player can attack again.
   */
  public get combatCooldown(): number {
    return this.property.combatCooldown;
  }

  /**
   * The amount of ticks till the player can attack again.
   */
  public set combatCooldown(value: number) {
    this.property.combatCooldown = value;
  }

  /**
   * Whether the player is on cooldown.
   */
  public isOnCooldown: boolean = false;

  /**
   * Whether the player is on critical cooldown.
   */
  public isOnCriticalCooldown: boolean = false;

  public onAdd(): void {
    // Check if the player has a combat property.
    if (
      this.player.getStorage().hasDynamicProperty(PlayerCombatTrait.identifier)
    )
      return;

    // Create a new combat property.
    this.player
      .getStorage()
      .setDynamicProperty<PlayerCombatProperty>(PlayerCombatTrait.identifier, {
        horizontalMaxReach: 3,
        verticalMaxReach: 3,
        horizontalKnockback: 0.4,
        verticalKnockback: 0.4,
        combatCooldown: 5
      });
  }

  public onRemove(): void {
    // Remove the combat property from the player.
    this.player
      .getStorage()
      .removeDynamicProperty(PlayerCombatTrait.identifier);
  }

  public onAttackEntity(target: Entity): void {
    // Check if the player is in reach of the target, and if the player is on cooldown.
    if (this.isOnCooldown || !this.isInReachOf(target)) return;

    // Check if the target has a health trait.
    if (!target.hasTrait(EntityHealthTrait)) return;

    // Check if the target is a player, and if the player is allowed to attack players.
    if (
      target.isPlayer() &&
      !this.player.abilities.getAbility(AbilityIndex.AttackPlayers)
    )
      return;

    // Check if the target is not a player, and if the player is allowed to attack mobs.
    if (
      !target.isPlayer() &&
      !this.player.abilities.getAbility(AbilityIndex.AttackMobs)
    )
      return;

    // Check if the target is a player, and if the target is in creative or spectator mode.
    if (
      target.isPlayer() &&
      (target.getGamemode() === Gamemode.Creative ||
        target.getGamemode() === Gamemode.Spectator)
    )
      return;

    // Get the health trait of the target.
    const health = target.getTrait(EntityHealthTrait);

    // We want to apply knock back to the entity when it is attacked, based on the direction the player is facing.
    // Get the direction the player is facing
    const { headYaw, pitch } = this.player.rotation;

    // Normalize the pitch & headYaw, so the entity will be spawned in the correct direction
    const headYawRad = (headYaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;

    // Calculate the horizontal knockback in the x direction
    const x =
      -Math.sin(headYawRad) *
      Math.cos(pitchRad) *
      this.getCalculatedHorizontalKnockback();

    // Calculate the vertical knockback
    const y = this.getCalculatedVerticalKnockback();

    // Calculate the horizontal knockback in the z direction
    const z =
      Math.cos(headYawRad) *
      Math.cos(pitchRad) *
      this.getCalculatedHorizontalKnockback();

    // Create a new vector for the knockback velocity.
    const newVelocity = new Vector3f(x, y, z);

    // Check if the target has an existing velocity in the y direction.
    if (target.velocity.y !== 0) newVelocity.y = target.velocity.y;

    // Set the velocity of the entity
    target.setMotion(newVelocity);

    // Check if the player is critical attacking the entity.
    const critical = !this.isOnCriticalCooldown && !this.player.onGround;

    // Get the calculated damage of the player.
    let damage = this.getCalculatedDamage(critical);

    // Check if the player is critical attacking the entity.
    if (critical) {
      // Create a new animate packet for the critical hit.
      const packet = new AnimatePacket();

      // Set the properties of the animate packet.
      packet.id = AnimateId.CriticalHit;
      packet.runtimeEntityId = target.runtimeId;
      packet.boatRowingTime = null;

      // Broadcast the animate packet to the dimension of the player.
      this.player.dimension.broadcast(packet);

      // Start the critical cooldown
      this.startCriticalCooldown();
    }

    // Check if the target has an equipment trait.
    if (target.hasTrait(EntityEquipmentTrait)) {
      // Get the equipment trait of the target.
      const equipment = target.getTrait(EntityEquipmentTrait);

      // Get the total protection of the armor items.
      const protection = equipment.calculateArmorProtection();

      // Calculate the reduction of the damage based on the protection.
      const reduction = Math.max(0, protection) / 30;

      // Apply the reduction to the damage.
      if (reduction >= 1) damage = 0;
      else if (reduction > 0) damage *= 1 - reduction;
    }

    // Apply damage to the entity
    health.applyDamage(damage, this.player, ActorDamageCause.EntityAttack);

    // Start the combat cooldown
    return this.startCooldown();
  }

  /**
   * Checks whether the entity is in reach of the player.
   * @param entity The entity to check if it is in reach of the player.
   * @returns Whether the entity is in reach of the player.
   */
  public isInReachOf(entity: Entity): boolean {
    // Get the distance between the player and the entity.
    const dx = this.player.position.x - entity.position.x;
    const dy = this.player.position.y - entity.position.y;
    const dz = this.player.position.z - entity.position.z;

    // Get the maximum reach of the player.
    if (Math.abs(dx) > this.horizontalMaxReach) return false;
    if (Math.abs(dy) > this.verticalMaxReach) return false;
    if (Math.abs(dz) > this.horizontalMaxReach) return false;

    // Return whether the entity is in reach of the player.
    return true;
  }

  /**
   * Gets the calculated horizontal knockback of the player based on the held item enchantments.
   * @returns The calculated horizontal knockback.
   */
  public getCalculatedHorizontalKnockback(): number {
    // Get the held item of the player.
    const item = this.player.getHeldItem();

    // Check if the item is not defined.
    if (!item) return this.horizontalKnockback;

    // Check if the item has a weapon trait.
    if (!item.hasTrait(ItemStackWeaponTrait)) return this.horizontalKnockback;

    // Get the weapon trait of the item.
    const weapon = item.getTrait(ItemStackWeaponTrait);

    // Return the calculated horizontal reach.
    return this.horizontalKnockback + weapon.getCalculatedKnockback();
  }

  /**
   * Gets the calculated vertical knockback of the player based on the held item enchantments.
   * @returns The calculated vertical knockback.
   */
  public getCalculatedVerticalKnockback(): number {
    return this.verticalKnockback;
  }

  /**
   * Gets the calculated damage of the player based on the held item enchantments.
   * @param critical Whether the damage is critical.
   * @returns The calculated damage.
   */
  public getCalculatedDamage(critical = false): number {
    // Get the held item of the player.
    const item = this.player.getHeldItem();

    // Check if the item is not defined.
    if (!item) return 1;

    // Check if the item has a weapon trait.
    if (!item.hasTrait(ItemStackWeaponTrait)) return 1;

    // Get the weapon trait of the item.
    const weapon = item.getTrait(ItemStackWeaponTrait);

    // Return the calculated damage.
    return critical
      ? weapon.getCalculatedCriticalDamage()
      : weapon.getCalculatedBaseDamage();
  }

  /**
   * Starts the combat cooldown of the player.
   * @param ticks The amount of ticks to cooldown the player; if not provided, the default combat cooldown will be used.
   */
  public startCooldown(ticks?: number): void {
    // Set the player on cooldown.
    this.isOnCooldown = true;

    // Schedule the combat cooldown
    this.player.world
      // Schedule the combat cooldown based on the provided ticks or the default combat cooldown.
      .schedule(ticks ?? this.combatCooldown)
      .on(() => (this.isOnCooldown = false)); // Set the player off cooldown.
  }

  /**
   * Starts the critical combat cooldown of the player.
   * @param ticks The amount of ticks to cooldown the player; if not provided, the default combat cooldown will be used multiplied by 5.
   */
  public startCriticalCooldown(ticks?: number): void {
    // Set the player on cooldown.
    this.isOnCriticalCooldown = true;

    // Schedule the combat cooldown
    this.player.world
      // Schedule the combat cooldown based on the provided ticks or the default combat cooldown.
      .schedule(ticks ?? this.combatCooldown * 5)
      .on(() => (this.isOnCriticalCooldown = false)); // Set the player off cooldown.
  }
}

export { PlayerCombatTrait };
