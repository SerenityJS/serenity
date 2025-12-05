import { ContainerType } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { EntityContainer } from "../../container";
import { Player } from "../../player";

import { PlayerTrait } from "./trait";

class PlayerCraftingInputTrait extends PlayerTrait {
  public static readonly identifier = "crafting_input";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * The container that holds the inventory items.
   */
  public readonly container: EntityContainer;

  /**
   * Creates a new entity inventory trait.
   * @param player The player that this trait will be attached to.
   */
  public constructor(player: Player) {
    super(player);

    // Create a new container
    this.container = new EntityContainer(player, ContainerType.Workbench, 9);
  }
}

export { PlayerCraftingInputTrait };
