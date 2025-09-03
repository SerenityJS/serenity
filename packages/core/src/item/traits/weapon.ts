import { Enchantment } from "@serenityjs/protocol";

import { ItemWeaponComponent } from "../../types";
import { ItemTypeDamageComponent } from "../identity";
import { ItemIdentifier, ItemTypeToolTier } from "../../enums";

import { ItemStackEnchantableTrait } from "./enchantable";
import { ItemStackTrait } from "./trait";

class ItemStackWeaponTrait extends ItemStackTrait {
  public static readonly identifier = "weapon";
  public static readonly tag: string = "minecraft:is_weapon";
  public static readonly component = ItemTypeDamageComponent;
  public static readonly types = [
    ItemIdentifier.WoodenSword,
    ItemIdentifier.WoodenAxe,
    ItemIdentifier.StoneSword,
    ItemIdentifier.StoneAxe,
    ItemIdentifier.CopperSword,
    ItemIdentifier.CopperAxe,
    ItemIdentifier.IronSword,
    ItemIdentifier.IronAxe,
    ItemIdentifier.GoldenSword,
    ItemIdentifier.GoldenAxe,
    ItemIdentifier.DiamondSword,
    ItemIdentifier.DiamondAxe,
    ItemIdentifier.NetheriteSword,
    ItemIdentifier.NetheriteAxe
  ];

  /**
   * The weapon component data for the item.
   */
  public get component(): ItemWeaponComponent {
    return this.item.getDynamicProperty(
      ItemStackWeaponTrait.identifier
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
    if (this.item.hasDynamicProperty(ItemStackWeaponTrait.identifier)) return;

    // Prepare the base and critical damage values
    let baseDamage = 2;
    let criticalDamage = 3;

    // Check if the item type has a damage component
    if (this.item.hasComponent(ItemTypeDamageComponent)) {
      // Get the damage component from the item type
      const damage = this.item.getComponent(ItemTypeDamageComponent);

      // Set the base and critical damage from the damage component
      baseDamage = damage.getDamage();
      criticalDamage = damage.getDamage() + 1;
    } else {
      // Switch based on the tier of the item
      switch (this.item.type.getToolTier()) {
        case ItemTypeToolTier.Wooden: {
          baseDamage = 4;
          criticalDamage = 6;
          break;
        }

        case ItemTypeToolTier.Stone: {
          baseDamage = 5;
          criticalDamage = 7;
          break;
        }

        case ItemTypeToolTier.Copper: {
          baseDamage = 5;
          criticalDamage = 7;
          break;
        }

        case ItemTypeToolTier.Iron: {
          baseDamage = 6;
          criticalDamage = 8;
          break;
        }

        case ItemTypeToolTier.Golden: {
          baseDamage = 4;
          criticalDamage = 6;
          break;
        }

        case ItemTypeToolTier.Diamond: {
          baseDamage = 7;
          criticalDamage = 9;
          break;
        }

        case ItemTypeToolTier.Netherite: {
          baseDamage = 8;
          criticalDamage = 10;
          break;
        }
      }
    }

    // Creata a new component for the item
    this.item.addDynamicProperty<ItemWeaponComponent>(
      ItemStackWeaponTrait.identifier,
      {
        baseDamage,
        criticalDamage
      }
    );
  }

  public onRemove(): void {
    // Remove the component from the item
    this.item.removeDynamicProperty(ItemStackWeaponTrait.identifier);
  }

  /**
   * Gets the calculated base damage of the weapon, taking into account any enchantments.
   * @returns The calculated base damage of the weapon.
   */
  public getCalculatedBaseDamage(): number {
    // Check if the item has the enchantment trait
    if (!this.item.hasTrait(ItemStackEnchantableTrait)) return this.baseDamage;

    // Get the enchantment trait
    const enchantable = this.item.getTrait(ItemStackEnchantableTrait);

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
    if (!this.item.hasTrait(ItemStackEnchantableTrait))
      return this.criticalDamage;

    // Get the enchantment trait
    const enchantable = this.item.getTrait(ItemStackEnchantableTrait);

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
    if (!this.item.hasTrait(ItemStackEnchantableTrait)) return 0;

    // Get the enchantment trait
    const enchantable = this.item.getTrait(ItemStackEnchantableTrait);

    // Get the knockback enchantment level
    const knockback = enchantable.getEnchantment(Enchantment.Knockback) ?? 0;

    // Return the calculated knockback
    return knockback * 0.6;
  }
}

export { ItemStackWeaponTrait };
