import { ItemStack } from "..";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class ItemStackDamagedSignal extends EventSignal {
  public static readonly identifier = WorldEvent.ItemStackDamaged;

  /**
   * The item stack that took damage.
   */
  public readonly itemStack: ItemStack;

  /**
   * The durability before the damage was dealt.
   */
  public readonly durabilityBefore: number;

  /**
   * The amount of damage dealt to the item stack.
   */
  public durbabilityDamageDealt: number;

  /**
   * Create a new item stack damaged event.
   * @param itemStack The item stack that took damage.
   * @param durabilityBefore The durability before the damage was dealt.
   * @param durabilityDamageDealt The amount of damage dealt to the item stack.
   */
  public constructor(
    itemStack: ItemStack,
    durabilityBefore: number,
    durabilityDamageDealt: number
  ) {
    super(itemStack.world);
    this.itemStack = itemStack;
    this.durabilityBefore = durabilityBefore;
    this.durbabilityDamageDealt = durabilityDamageDealt;
  }
}

export { ItemStackDamagedSignal };
