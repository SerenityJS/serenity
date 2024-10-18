import { ContainerId, ContainerType } from "@serenityjs/protocol";

import { EntityIdentifier, ItemIdentifier } from "../../../enums";
import { EntityContainer } from "../../container";
import { ItemStack } from "../../../item";
import { JSONLikeObject, JSONLikeValue } from "../../../types";
import { Player } from "../../player";

import { PlayerTrait } from "./trait";

interface ItemStackEntry extends JSONLikeObject {
  slot: number;
  identifier: ItemIdentifier;
  amount: number;
  auxillary: number;
  traits: Array<string>;
  components: Array<[string, JSONLikeValue]>;
}

interface InventoryComponent extends JSONLikeObject {
  size: number;
  items: Array<ItemStackEntry>;
}

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
   * The identifier of the container that this trait represents.
   */
  public readonly containerId: ContainerId = ContainerId.Ui;

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
      this.containerId,
      this.inventorySize
    );
  }

  public onSpawn(): void {
    // Check if the entity has an inventory component
    if (this.entity.components.has("inventory")) {
      // Get the inventory component from the entity
      const inventory = this.entity.components.get(
        "inventory"
      ) as InventoryComponent;

      // Iterate over each item in the inventory
      for (const item of inventory.items) {
        // Create a new item stack
        const stack = new ItemStack(item.identifier, {
          amount: item.amount,
          auxillary: item.auxillary
        });

        // TODO: Load the item stack traits

        // Add the item stack to the container
        this.container.setItem(item.slot, stack);
      }
    }
  }

  public onDespawn(): void {
    // Create a new inventory component
    const inventory: InventoryComponent = {
      size: this.inventorySize,
      items: []
    };

    // Iterate over each item in the container
    for (let i = 0; i < this.inventorySize; i++) {
      // Get the item stack at the index
      const item = this.container.getItem(i);

      // If the item stack is null, skip
      if (item === null) continue;

      // Create a new item stack entry
      const entry: ItemStackEntry = {
        slot: i,
        identifier: item.type.identifier,
        amount: item.amount,
        auxillary: item.auxillary,
        traits: [],
        components: []
      };

      // Push the item stack entry to the inventory items
      inventory.items.push(entry);
    }

    // Set the inventory component to the entity
    this.entity.components.set("inventory", inventory);
  }
}

export { PlayerCursorTrait };
