import { ContainerId, ContainerType } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { EntityContainer } from "../../container";
import { Player } from "../../player";
import { Recipe } from "../../../item";

import { PlayerTrait } from "./trait";

class PlayerCraftingInputTrait extends PlayerTrait {
  public static readonly identifier = "crafting_input";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * The container that holds the inventory items.
   */
  public readonly container: EntityContainer;

  /**
   * The currently pending crafting recipe, if any.
   */
  public pendingCraftingRecipe: Recipe | null = null;

  /**
   * The amount of items to craft, if any.
   */
  public pendingCraftingAmount: number | null = null;

  /**
   * Creates a new entity inventory trait.
   * @param player The player that this trait will be attached to.
   */
  public constructor(player: Player) {
    super(player);

    // Create a new container
    this.container = new EntityContainer(
      player,
      ContainerType.Workbench,
      ContainerId.Ui,
      9
    );
  }
}

export { PlayerCraftingInputTrait };
