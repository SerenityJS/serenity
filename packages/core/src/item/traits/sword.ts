import { ItemIdentifier, ItemToolTier } from "../../enums";
import { ItemWeaponComponent } from "../../types";

import { ItemWeaponTrait } from "./weapon";

class ItemSwordTrait<T extends ItemIdentifier> extends ItemWeaponTrait<T> {
  public static readonly tag = "minecraft:is_sword";

  public onAdd(): void {
    // Check if the item has the weapon component
    if (this.item.hasDynamicProperty(ItemWeaponTrait.identifier)) return;

    // Prepare the base and critical damage values
    let baseDamage = 3;
    let criticalDamage = 4;

    // Switch based on the tier of the item
    switch (this.item.type.tier) {
      case ItemToolTier.Wooden: {
        baseDamage = 4;
        criticalDamage = 6;
        break;
      }

      case ItemToolTier.Stone: {
        baseDamage = 5;
        criticalDamage = 7;
        break;
      }

      case ItemToolTier.Iron: {
        baseDamage = 6;
        criticalDamage = 8;
        break;
      }

      case ItemToolTier.Gold: {
        baseDamage = 4;
        criticalDamage = 6;
        break;
      }

      case ItemToolTier.Diamond: {
        baseDamage = 7;
        criticalDamage = 9;
        break;
      }

      case ItemToolTier.Netherite: {
        baseDamage = 8;
        criticalDamage = 10;
        break;
      }
    }

    // Create a new component for the item
    this.item.addDynamicProperty<ItemWeaponComponent>(
      ItemWeaponTrait.identifier,
      {
        baseDamage,
        criticalDamage
      }
    );
  }
}

export { ItemSwordTrait };
