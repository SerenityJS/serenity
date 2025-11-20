import { ContainerId, ContainerType } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { EntityContainer } from "../../container";
import { Player } from "../../player";

import { PlayerTrait } from "./trait";

class PlayerCursorTrait extends PlayerTrait {
  public static readonly identifier = "cursor";

  public static readonly types = [EntityIdentifier.Player];

  /**
   * The container that holds the inventory items.
   */
  public readonly container: EntityContainer;

  /**
   * The type of container that this trait represents.
   */
  public readonly containerType: ContainerType = ContainerType.Inventory;

  /**
   * The amount of slots in the inventory.
   */
  public readonly inventorySize: number = 1;

  /**
   * The selected slot in the inventory.
   */
  public selectedSlot: number = 0;

  public constructor(player: Player) {
    super(player);

    // Create a new container
    this.container = new EntityContainer(
      player,
      this.containerType,
      this.inventorySize
    );

    // Assign the container identifier
    this.container.identifier = ContainerId.Ui;
  }
}

export { PlayerCursorTrait };
