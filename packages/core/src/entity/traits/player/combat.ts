import {
  AbilityIndex,
  ActorDamageCause,
  AnimatePacket,
  Vector3f,
  AnimateType,
  Gamemode
} from "@serenityjs/protocol";
import { FloatTag } from "@serenityjs/nbt";

import { EntityIdentifier } from "../../../enums";
import { ItemStackWeaponTrait } from "../../../item";
import { Entity } from "../../entity";
import { EntityHealthTrait } from "../attribute";
import { EntityEquipmentTrait } from "../equipment";

import { PlayerTrait } from "./trait";

class PlayerCombatTrait extends PlayerTrait {
  public static readonly identifier = "combat";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * Whether the player is on cooldown.
   */
  private isOnCooldown: boolean = false;

  /**
   * Whether the player is on critical cooldown.
   */
  private isOnCriticalCooldown: boolean = false;

  /**
   * Whether the player is currently on combat cooldown.
   * @returns Whether the player is on combat cooldown.
   */
  public getIsOnCooldown(): boolean {
    return this.isOnCooldown;
  }

  /**
   * Whether the player is currently on critical combat cooldown.
   * @returns Whether the player is on critical combat cooldown.
   */
  public getIsOnCriticalCooldown(): boolean {
    return this.isOnCriticalCooldown;
  }

  /**
   * Get the horizontal max reach of the player.
   * @returns The horizontal max reach of the player.
   */
  public getHorizontalMaxReach(): number {
    // Fetch the horizontal max reach from the player storage.
    const value = this.player.getStorageEntry<FloatTag>("horizontalMaxReach");

    // Return the horizontal max reach or the default value of 3.
    return value ? value.valueOf() : 3;
  }

  /**
   * Set the horizontal max reach of the player.
   * @param value The horizontal max reach to set.
   */
  public setHorizontalMaxReach(value: number): void {
    // Set the horizontal max reach in the player storage.
    this.player.setStorageEntry("horizontalMaxReach", new FloatTag(value));
  }

  /**
   * Reset the horizontal max reach of the player to the default value.
   */
  public resetHorizontalMaxReachToDefault(): void {
    this.player.removeStorageEntry("horizontalMaxReach");
  }

  /**
   * Get the vertical max reach of the player.
   * @returns The vertical max reach of the player.
   */
  public getVerticalMaxReach(): number {
    // Fetch the vertical max reach from the player storage.
    const value = this.player.getStorageEntry<FloatTag>("verticalMaxReach");

    // Return the vertical max reach or the default value of 3.
    return value ? value.valueOf() : 3;
  }

  /**
   * Set the vertical max reach of the player.
   * @param value The vertical max reach to set.
   */
  public setVerticalMaxReach(value: number): void {
    // Set the vertical max reach in the player storage.
    this.player.setStorageEntry("verticalMaxReach", new FloatTag(value));
  }

  /**
   * Reset the vertical max reach of the player to the default value.
   */
  public resetVerticalMaxReachToDefault(): void {
    this.player.removeStorageEntry("verticalMaxReach");
  }

  /**
   * Get the horizontal knockback of the player.
   * @returns The horizontal knockback of the player.
   */
  public getHorizontalKnockback(): number {
    // Fetch the horizontal knockback from the player storage.
    const value = this.player.getStorageEntry<FloatTag>("horizontalKnockback");

    // Return the horizontal knockback or the default value of 0.4.
    return value ? value.valueOf() : 0.4;
  }

  /**
   * Set the horizontal knockback of the player.
   * @param value The horizontal knockback to set.
   */
  public setHorizontalKnockback(value: number): void {
    // Set the horizontal knockback in the player storage.
    this.player.setStorageEntry("horizontalKnockback", new FloatTag(value));
  }

  /**
   * Reset the horizontal knockback of the player to the default value.
   */
  public resetHorizontalKnockbackToDefault(): void {
    this.player.removeStorageEntry("horizontalKnockback");
  }

  /**
   * Get the vertical knockback of the player.
   * @returns The vertical knockback of the player.
   */
  public getVerticalKnockback(): number {
    // Fetch the vertical knockback from the player storage.
    const value = this.player.getStorageEntry<FloatTag>("verticalKnockback");

    // Return the vertical knockback or the default value of 0.4.
    return value ? value.valueOf() : 0.4;
  }

  /**
   * Set the vertical knockback of the player.
   * @param value The vertical knockback to set.
   */
  public setVerticalKnockback(value: number): void {
    // Set the vertical knockback in the player storage.
    this.player.setStorageEntry("verticalKnockback", new FloatTag(value));
  }

  /**
   * Reset the vertical knockback of the player to the default value.
   */
  public resetVerticalKnockbackToDefault(): void {
    this.player.removeStorageEntry("verticalKnockback");
  }

  /**
   * Get the combat cooldown of the player.
   * @returns The combat cooldown of the player.
   */
  public getCombatCooldown(): number {
    // Fetch the combat cooldown from the player storage.
    const value = this.player.getStorageEntry<FloatTag>("combatCooldown");

    // Return the combat cooldown or the default value of 5.
    return value ? value.valueOf() : 5;
  }

  /**
   * Set the combat cooldown of the player.
   * @param value The combat cooldown to set.
   */
  public setCombatCooldown(value: number): void {
    // Set the combat cooldown in the player storage.
    this.player.setStorageEntry("combatCooldown", new FloatTag(value));
  }

  /**
   * Reset the combat cooldown of the player to the default value.
   */
  public resetCombatCooldownToDefault(): void {
    this.player.removeStorageEntry("combatCooldown");
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
      packet.type = AnimateType.CriticalHit;
      packet.actorRuntimeId = target.runtimeId;
      packet.data = 0;

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
    if (Math.abs(dx) > this.getHorizontalMaxReach()) return false;
    if (Math.abs(dy) > this.getVerticalMaxReach()) return false;
    if (Math.abs(dz) > this.getHorizontalMaxReach()) return false;

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
    if (!item) return this.getHorizontalKnockback();

    // Check if the item has a weapon trait.
    if (!item.hasTrait(ItemStackWeaponTrait))
      return this.getHorizontalKnockback();

    // Get the weapon trait of the item.
    const weapon = item.getTrait(ItemStackWeaponTrait);

    // Return the calculated horizontal reach.
    return this.getHorizontalKnockback() + weapon.getCalculatedKnockback();
  }

  /**
   * Gets the calculated vertical knockback of the player based on the held item enchantments.
   * @returns The calculated vertical knockback.
   */
  public getCalculatedVerticalKnockback(): number {
    return this.getVerticalKnockback();
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
      .schedule(ticks ?? this.getCombatCooldown())
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
      .schedule(ticks ?? this.getCombatCooldown() * 5)
      .on(() => (this.isOnCriticalCooldown = false)); // Set the player off cooldown.
  }
}

export { PlayerCombatTrait };
