import { ContainerType } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { EntityContainer } from "../../container";
import { Player } from "../../player";

import { PlayerTrait } from "./trait";

class PlayerCraftingOutputTrait extends PlayerTrait {
  public static readonly identifier = "crafting_output";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * The container that holds the output item.
   */
  public readonly container: EntityContainer;

  /**
   * Creates a new player crafting output trait.
   * @param player The player that this trait will be attached to.
   */
  public constructor(player: Player) {
    super(player);

    // Create a new container
    this.container = new EntityContainer(player, ContainerType.Inventory, 1);
  }
}

export { PlayerCraftingOutputTrait };
