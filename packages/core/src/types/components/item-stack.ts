import { JSONLikeObject } from "../json";

interface ItemWeaponComponent extends JSONLikeObject {
  /**
   * The base damage of the weapon.
   */
  baseDamage: number;

  /**
   * The critical damage of the weapon.
   */
  criticalDamage: number;
}

export { ItemWeaponComponent };
