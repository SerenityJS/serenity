import { Awaitable } from "@serenityjs/emitter";

import { Player } from "../../entity";
import { BlockIdentifier } from "../../enums";
import { Trait } from "../../trait";
import { Block } from "../block";
import { Container } from "../../container";
import {
  BlockDestroyOptions,
  BlockInteractionOptions,
  BlockPlacementOptions,
  JSONLikeObject
} from "../../types";
import { Dimension } from "../../world";

class BlockTrait extends Trait {
  /**
   * The block state key that this trait is compatible with by default.
   * If null, the trait will not be initialized by any block state.
   */
  public static readonly state: string | null = null;

  /**
   * The block component identifiers that this trait is compatible with by default.
   * If empty, the trait will not be initialized by any component.
   */
  public static readonly components: Array<string> = [];

  /**
   * The block type identifiers that this trait is compatible with by default.
   */
  public static readonly types: Array<BlockIdentifier> = [];

  /**
   * The block that this trait is attached to.
   */
  protected readonly block: Block;

  /**
   * The dimension that the block is in.
   */
  protected readonly dimension: Dimension;

  /**
   * The block state key that this trait is compatible with.
   * If null, the trait will not be initialized by any block state.
   */
  public readonly state = (this.constructor as typeof BlockTrait).state;

  /**
   * The block component identifiers that this trait is compatible with.
   * If empty, the trait will not be initialized by any component.
   */
  public readonly components = (this.constructor as typeof BlockTrait)
    .components;

  /**
   * Creates a new instance of the block trait.
   * @param block The block that this trait will be attached to.
   * @param options additional options for the block trait.
   */
  public constructor(block: Block, _options?: JSONLikeObject) {
    super();

    // Assign the properties of the block trait.
    this.block = block;
    this.dimension = block.dimension;
  }

  /**
   * Called when the block is updated in the world.
   * @param source The source of the update, if any.
   */
  public onUpdate?(source?: Block): Awaitable<void>;

  /**
   * Called when the block is placed in the world.
   * @param options The options of the block placement.
   * @returns Whether the block placement was successful; default is true.
   */
  public onPlace?(options: BlockPlacementOptions): Awaitable<boolean | void>;

  /**
   * Called when the block is broken in the world.
   * @param player Whether the player broke the block; most cases it will be defined.
   * @returns Whether the block break was successful; default is true.
   */
  public onBreak?(options: BlockDestroyOptions): Awaitable<boolean | void>;

  /**
   * Called when the block is started to be broken in the world.
   * @param player The player that started to break the block.
   */
  public onStartBreak?(player: Player): Awaitable<boolean | void>;

  /**
   * Called when the block is stopped to be broken in the world.
   * @param player The player that stopped breaking the block.
   */
  public onStopBreak?(player: Player): Awaitable<void>;

  /**
   * Called when the block is interacted with by a player.
   * @param options The options of the block interaction.
   * @returns Whether the interaction was successful; default is true.
   */
  public onInteract?(
    options: BlockInteractionOptions
  ): Awaitable<boolean | void>;

  /**
   * Called when a player pick blocks the block.
   * @param player The player that picked the block.
   * @param withData Whether the player picked the block with a data request.
   */
  public onPick?(player: Player, withData: boolean): Awaitable<void>;

  /**
   * Called when a container that is attached to the block is updated.
   * @param container The container that was updated.
   */
  public onContainerUpdate?(container: Container): Awaitable<void>;

  public onReplace?(): Awaitable<void>;
}

export { BlockTrait };
