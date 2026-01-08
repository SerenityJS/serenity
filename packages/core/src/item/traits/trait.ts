import { ItemUseMethod } from "@serenityjs/protocol";

import { ItemIdentifier } from "../../enums";
import { Trait } from "../../trait";

import type { ItemTypeComponent } from "../identity";
import type { JSONLikeObject } from "../../types";
import type { ItemStack } from "../stack";
import type { Player } from "../../entity";
import type {
  ItemStackUseOptions,
  ItemStackUseOnBlockOptions,
  ItemStackUseOnEntityOptions,
  ItemStackDroppedOptions
} from "../types";

class ItemStackTrait extends Trait {
  /**
   * The item type identifiers that this trait is compatible with by default.
   */
  public static readonly types: Array<ItemIdentifier | string> = [];

  /**
   * The item tag(s) that this trait is compatible with by default.
   * If null, the trait will not attach to any item stack by default.
   */
  public static readonly tag: string | Array<string> | null = null;

  /**
   * The item component(s) that this trait is compatible with by default.
   * If null, the trait will not attach to any item stack by default.
   */
  public static readonly component:
    | typeof ItemTypeComponent
    | Array<typeof ItemTypeComponent>
    | null = null;

  /**
   * The item stack that this trait is attached to.
   */
  protected readonly item: ItemStack;

  /**
   * Creates a new instance of the item trait.
   * @param item The item stack that this trait will be attached to.
   * @param options additional options for the item trait.
   */
  public constructor(item: ItemStack, _options?: JSONLikeObject) {
    super();
    this.item = item;
  }

  /**
   * Called when the item is used by a player.
   * @param player The player that used the item.
   * @param options The additional options for the item use.
   * @returns Whether the item use was successful; default is true
   */
  public onStartUse?(
    player: Player,
    options: ItemStackUseOptions
  ): boolean | void;

  /**
   * Called when the item is stopped being used by a player.
   * @param player The player that stopped using the item.
   * @param options The additional options for the item use.
   */
  public onStopUse?(
    player: Player,
    options: ItemStackUseOptions
  ): boolean | void;

  /**
   * Called when the item is used by a player.
   * @param player The player that used the item.
   * @param options The additional options for the item use.
   */
  public onUse?(
    player: Player,
    options: ItemStackUseOptions
  ): boolean | ItemUseMethod | void;

  /**
   * Called when the item is used on a block by a player.
   * @param player The player that used the item.
   * @param options The additional options for the item use.
   */
  public onUseOnBlock?(
    player: Player,
    options: ItemStackUseOnBlockOptions
  ): boolean | ItemUseMethod | void;

  /**
   * Called when the item is used on an entity by a player.
   * @param player The player that used the item.
   * @param options The additional options for the item use.
   */
  public onUseOnEntity?(
    player: Player,
    options: ItemStackUseOnEntityOptions
  ): boolean | ItemUseMethod | void;

  /**
   * Called when the item has been signaled to cooldown.
   * @param duration The duration of the cooldown in ticks.
   */
  public onStartCooldown?(duration: number): void;

  /**
   * Called when the item cooldown has stopped.
   */
  public onStopCooldown?(): void;

  /**
   * Called when the container that the item is stored in is opened.
   * @param player The player that opened the container.
   */
  public onContainerOpen?(player: Player): void;

  /**
   * Called when the container that the item is stored in is closed.
   * @param player The player that closed the container
   */
  public onContainerClose?(player: Player): void;

  /**
   * Called when the item is dropped by a player or entity.
   * @param options The options for the item stack that was dropped.
   */
  public onDropped?(options: ItemStackDroppedOptions): void;

  /**
   * Compares another item trait to this one.
   * @param other The other item trait to compare.
   * @returns Whether the item traits are equal.
   */
  public equals(other: ItemStackTrait): boolean {
    return this.identifier === other.identifier;
  }

  /**
   * Clones the item trait to another item stack.
   * @param item The item stack to clone the component to.
   * @returns A new item trait.
   */
  public clone(item: ItemStack): this {
    // Create a new instance of the trait
    const component = new (this.constructor as new (
      item: ItemStack,
      identifier: string
    ) => ItemStackTrait)(item, this.identifier) as this;

    // Copy the key-value pairs.
    for (const [key, value] of Object.entries(this)) {
      // Skip the item.
      if (key === "item") continue;

      // @ts-ignore: We know the key is a valid key of ItemStackTrait
      component[key as keyof ItemStackTrait] = value as never;
    }

    // Return the trait
    return component;
  }
}

export { ItemStackTrait };
