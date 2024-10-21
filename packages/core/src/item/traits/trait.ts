import { Player } from "../../entity";
import { ItemIdentifier } from "../../enums";
import { Trait } from "../../trait";
import { Items, ItemUseOptions } from "../../types";
import { ItemStack } from "../stack";

class ItemTrait<T extends keyof Items> extends Trait {
  /**
   * The item type identifiers that this trait is compatible with by default.
   */
  public static readonly types: Array<ItemIdentifier> = [];

  /**
   * The item stack that this trait is attached to.
   */
  protected readonly item: ItemStack<T>;

  /**
   * Creates a new instance of the item trait.
   * @param item The item stack that this trait will be attached to.
   */
  public constructor(item: ItemStack<T>) {
    super();
    this.item = item;

    // Register the trait to the item stack
    item.traits.set(this.identifier, this);
  }

  /**
   * Called when the item is used by a player.
   * @param player The player that used the item.
   * @param options The additional options for the item use.
   * @returns Whether the item use was successful; default is true
   */
  public onStartUse?(
    player: Player,
    options: Partial<ItemUseOptions>
  ): boolean | void;

  /**
   * Called when the item is stopped being used by a player.
   * @param player The player that stopped using the item.
   * @param options The additional options for the item use.
   */
  public onStopUse?(
    player: Player,
    options: Partial<ItemUseOptions>
  ): boolean | void;

  /**
   * Called when the item is used by a player.
   * @param player The player that used the item.
   * @param options The additional options for the item use.
   */
  public onUse?(
    player: Player,
    options: Partial<ItemUseOptions>
  ): boolean | void;

  /**
   * Compares another item trait to this one.
   * @param other The other item trait to compare.
   * @returns Whether the item traits are equal.
   */
  public equals(other: ItemTrait<T>): boolean {
    return this.identifier === other.identifier;
  }
}

export { ItemTrait };
