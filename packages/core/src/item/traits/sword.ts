import { ItemTypeToolTier } from "../../enums";
import { ItemWeaponComponent } from "../../types";

import { ItemStackWeaponTrait } from "./weapon";

class ItemStackSwordTrait extends ItemStackWeaponTrait {
  public static readonly tag = "minecraft:is_sword";

  public onAdd(): void {
    // Check if the item has the weapon component
    if (this.item.hasDynamicProperty(ItemStackWeaponTrait.identifier)) return;

    // Prepare the base and critical damage values
    let baseDamage = 3;
    let criticalDamage = 4;

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

    // Create a new component for the item
    this.item.addDynamicProperty<ItemWeaponComponent>(
      ItemStackWeaponTrait.identifier,
      {
        baseDamage,
        criticalDamage
      }
    );
  }
}

export { ItemStackSwordTrait };
