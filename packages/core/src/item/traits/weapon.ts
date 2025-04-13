import { Enchantment } from "@serenityjs/protocol";

import { ItemWeaponComponent } from "../../types";

import { ItemEnchantableTrait } from "./enchantable";
import { ItemTrait } from "./trait";

class ItemWeaponTrait extends ItemTrait {
  public static readonly identifier = "weapon";
  public static readonly tag: string = "minecraft:is_weapon";

  /**
   * The weapon component data for the item.
   */
  public get component(): ItemWeaponComponent {
    return this.item.getDynamicProperty(
      ItemWeaponTrait.identifier
    ) as ItemWeaponComponent;
  }

  /**
   * The base damage of the weapon.
   */
  public get baseDamage(): number {
    return this.component.baseDamage;
  }

  /**
   * The base damage of the weapon.
   */
  public set baseDamage(value: number) {
    this.component.baseDamage = value;
  }

  /**
   * The critical damage of the weapon.
   */
  public get criticalDamage(): number {
    return this.component.criticalDamage;
  }

  /**
   * The critical damage of the weapon.
   */
  public set criticalDamage(value: number) {
    this.component.criticalDamage = value;
  }

  public onAdd(): void {
    // Create if the item does not have the component
    if (this.item.hasDynamicProperty(ItemWeaponTrait.identifier)) return;

    // Creata a new component for the item
    this.item.addDynamicProperty<ItemWeaponComponent>(
      ItemWeaponTrait.identifier,
      {
        baseDamage: 2,
        criticalDamage: 3
      }
    );
  }

  public onRemove(): void {
    // Remove the component from the item
    this.item.removeDynamicProperty(ItemWeaponTrait.identifier);
  }

  /**
   * Gets the calculated base damage of the weapon, taking into account any enchantments.
   * @returns The calculated base damage of the weapon.
   */
  public getCalculatedBaseDamage(): number {
    // Check if the item has the enchantment trait
    if (!this.item.hasTrait(ItemEnchantableTrait)) return this.baseDamage;

    // Get the enchantment trait
    const enchantable = this.item.getTrait(ItemEnchantableTrait);

    // Get the sharpness enchantment level
    const sharpness = enchantable.getEnchantment(Enchantment.Sharpness) ?? 0;

    // Return the calculated base damage
    return this.baseDamage + (1 + sharpness * 0.05);
  }

  /**
   * Gets the calculated critical damage of the weapon, taking into account any enchantments.
   * @returns The calculated critical damage of the weapon.
   */
  public getCalculatedCriticalDamage(): number {
    // Check if the item has the enchantment trait
    if (!this.item.hasTrait(ItemEnchantableTrait)) return this.criticalDamage;

    // Get the enchantment trait
    const enchantable = this.item.getTrait(ItemEnchantableTrait);

    // Get the sharpness enchantment level
    const sharpness = enchantable.getEnchantment(Enchantment.Sharpness) ?? 0;

    // Return the calculated base damage
    return this.criticalDamage + (1 + sharpness * 0.05);
  }

  /**
   * Gets the calculated knockback of the weapon, taking into account any enchantments.
   * @returns The calculated knockback of the weapon.
   */
  public getCalculatedKnockback(): number {
    // Check if the item has the enchantment trait
    if (!this.item.hasTrait(ItemEnchantableTrait)) return 0;

    // Get the enchantment trait
    const enchantable = this.item.getTrait(ItemEnchantableTrait);

    // Get the knockback enchantment level
    const knockback = enchantable.getEnchantment(Enchantment.Knockback) ?? 0;

    // Return the calculated knockback
    return knockback * 0.6;
  }
}

export { ItemWeaponTrait };
