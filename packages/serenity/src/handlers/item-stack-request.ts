import {
  ContainerName,
  DisconnectReason,
  type ItemStackAction,
  ItemStackActionType,
  ItemStackRequestPacket,
  type NetworkItemInstanceDescriptor,
} from "@serenityjs/protocol";
import { Container, ItemStack, type Player } from "@serenityjs/world";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class ItemStackRequest extends SerenityHandler {
  public static readonly packet = ItemStackRequestPacket.id;

  public static handle(packet: ItemStackRequestPacket, session: NetworkSession): void {
    // Get the player from the session
    // If there is no player, then disconnect the session.
    const player = this.serenity.getPlayer(session);
    if (!player) return session.disconnect("Failed to connect due to an invalid player. Please try again.", DisconnectReason.InvalidPlayer);

    // Loop through the requests.
    for (const request of packet.requests) {
      // Loop through the actions.
      for (const action of request.actions) {
        switch (action.type) {
          default: {
            this.serenity.network.logger.debug("ItemStackAction not implemented:", ItemStackActionType[action.type]);
            break;
          }

          case ItemStackActionType.Take: {
            this.handleTakeAction(player, action);
            break;
          }

          case ItemStackActionType.Place: {
            this.handlePlaceAction(player, action);
            break;
          }

          case ItemStackActionType.Destroy: {
            this.handleDestroyAction(player, action);
            break;
          }

          case ItemStackActionType.CraftCreative: {
            const resultsAction = request.actions[1] as ItemStackAction;
            const descriptor = (resultsAction.resultItems as Array<NetworkItemInstanceDescriptor>)[0] as NetworkItemInstanceDescriptor;

            const action = request.actions[2] as ItemStackAction;

            this.handleCreativeSelectAction(player, action, descriptor);
            break;
          }
        }
      }
    }
  }

  protected static handleTakeAction(player: Player, action: ItemStackAction): void {
    // Check if the source exists.
    if (!action.source?.type) throw new Error("Invalid source type.");
    console.log(` Source: ${ContainerName[action.source?.type ?? 0]} Destination: ${ContainerName[action.destination?.type ?? 0]}`);
    switch (action.source?.type) {
      default: {
        this.serenity.network.logger.warn("ItemStackAction.take not implemented:", ContainerName[action.source.type]);
        break;
      }

      case ContainerName.Armor: {
        this.takeFromArmor(player, action);
        break;
      }

      case ContainerName.Container: {
        this.takeFromContainer(player, action);
        break;
      }

      case ContainerName.Hotbar:
      case ContainerName.Inventory:
      case ContainerName.HotbarAndInventory: {
        this.takeFromInventory(player, action);
        break;
      }
    }
  }

  protected static takeFromArmor(player: Player, action: ItemStackAction): void {
    const count = action.count;

    if (!count) throw new Error("Invalid count.");
    const sourceSlot = action.source?.slot;
    const destinationSlot = action.destination?.slot;

    if (sourceSlot === undefined || destinationSlot === undefined) throw new Error("Invalid source or destination slot.");

    // Get the armor container && destination containers
    const { container: source } = player.getComponent("minecraft:armor");
    const destination =
      action.destination?.type === ContainerName.Cursor ? player.getComponent("minecraft:cursor").container : player.openedContainer;

    // Check if the source and destination containers exist.
    if (!source || !destination) throw new Error("Invalid source or destination.");
    // Get the source items.
    const sourceItem = source.getItem(action.source?.slot ?? 0);

    // Check if the source item exists.
    if (!sourceItem) throw new Error("Invalid source item.");
    if (count != sourceItem.amount) throw new Error("Invalid count possible.");
    const item = source.takeItem(sourceSlot, count);

    if (!item) throw new Error("Invalid item.");
    destination.setItem(destinationSlot, item);
  }

  protected static takeFromContainer(player: Player, action: ItemStackAction): void {
    const count = action.count;

    if (!count) throw new Error("Invalid count.");

    const sourceSlot = action.source?.slot;
    const destinationSlot = action.destination?.slot;

    if (sourceSlot === undefined || destinationSlot === undefined) throw new Error("Invalid source or destination slot.");

    // Get the source and destination containers.
    const source = player.openedContainer;
    const destination =
      action.destination?.type === ContainerName.Cursor
        ? player.getComponent("minecraft:cursor").container
        : ContainerName.Inventory || ContainerName.Hotbar || ContainerName.HotbarAndInventory
          ? player.getComponent("minecraft:inventory").container
          : player.openedContainer;

    // Check if the source and destination containers exist.
    if (source === null || destination === null) throw new Error("Invalid source or destination.");

    // Get the source and destination items.
    const sourceItem = source.getItem(action.source?.slot ?? 0);
    const destinationItem = destination.getItem(action.destination?.slot ?? 0);

    // Check if the source item exists.
    if (!sourceItem) throw new Error("Invalid source item.");

    if (count <= sourceItem.amount) {
      const item = source.takeItem(sourceSlot, count);

      if (!item) throw new Error("Invalid item.");

      if (destinationItem) {
        destinationItem.increment(item.amount);
      } else {
        destination.setItem(destinationSlot, item);
      }
    } else throw new Error("Invalid count possible.");
  }

  protected static takeFromInventory(player: Player, action: ItemStackAction): void {
    const count = action.count;

    if (!count) throw new Error("Invalid count.");

    const sourceSlot = action.source?.slot;
    const destinationSlot = action.destination?.slot;

    if (sourceSlot === undefined || destinationSlot === undefined) throw new Error("Invalid source or destination slot.");

    // Get the source and destination containers.
    const { container: source } = player.getComponent("minecraft:inventory");
    const destination =
      /* action.destination?.type === ContainerName.Armor
        ? player.getComponent("minecraft:armor").container
        : */ action.destination?.type === ContainerName.Cursor ? player.getComponent("minecraft:cursor").container : player.openedContainer;

    // Check if the source and destination containers exist.
    if (source === null || destination === null) throw new Error("Invalid source or destination.");

    // Get the source and destination items.
    const sourceItem = source.getItem(action.source?.slot ?? 0);
    const destinationItem = destination.getItem(action.destination?.slot ?? 0);

    // Check if the source item exists.
    if (!sourceItem) throw new Error("Invalid source item.");

    if (count <= sourceItem.amount) {
      const item = source.takeItem(sourceSlot, count);

      if (!item) throw new Error("Invalid item.");

      if (destinationItem) {
        destinationItem.increment(item.amount);
      } else {
        destination.setItem(destinationSlot, item);
      }
    } else throw new Error("Invalid count possible.");
  }

  protected static handlePlaceAction(player: Player, action: ItemStackAction): void {
    // Check if the source exists.
    if (!action.source?.type) throw new Error("Invalid source type.");
    console.log(` Source: ${ContainerName[action.source?.type ?? 0]} Destination: ${ContainerName[action.destination?.type ?? 0]}`);
    switch (action.source?.type) {
      default: {
        this.serenity.network.logger.warn("ItemStackAction.place not implemented:", ContainerName[action.source.type]);
        break;
      }

      case ContainerName.Container: {
        this.placeFromContainer(player, action);
        break;
      }

      case ContainerName.Armor:
      case ContainerName.Inventory:
      case ContainerName.Hotbar:
      case ContainerName.HotbarAndInventory: {
        this.placeFromInventory(player, action);
        break;
      }

      case ContainerName.Cursor: {
        this.placeFromCursor(player, action);
        break;
      }
    }
  }

  protected static placeFromContainer(player: Player, action: ItemStackAction): void {
    const count = action.count;

    if (!count) throw new Error("Invalid count.");

    const sourceSlot = action.source?.slot;
    const destinationSlot = action.destination?.slot;

    if (sourceSlot === undefined || destinationSlot === undefined) throw new Error("Invalid source or destination slot.");

    // Get the source and destination containers.
    const source = player.openedContainer;
    const destination =
      action.destination?.type === ContainerName.Armor
        ? player.getComponent("minecraft:armor").container
        : action.destination?.type === ContainerName.Cursor
          ? player.getComponent("minecraft:cursor").container
          : ContainerName.Inventory || ContainerName.Hotbar || ContainerName.HotbarAndInventory
            ? player.getComponent("minecraft:inventory").container
            : player.openedContainer;

    // Check if the source and destination containers exist.
    if (source === null || destination === null) throw new Error("Invalid source or destination.");

    // Get the source and destination items.
    const sourceItem = source.getItem(action.source?.slot ?? 0);
    const destinationItem = destination.getItem(action.destination?.slot ?? 0);

    // Check if the source item exists.
    if (!sourceItem) throw new Error("Invalid source item.");

    if (count <= sourceItem.amount) {
      const item = source.takeItem(sourceSlot, count);

      if (!item) throw new Error("Invalid item.");

      if (destinationItem) {
        destinationItem.increment(item.amount);
      } else {
        destination.setItem(destinationSlot, item);
      }
    } else throw new Error("Invalid count possible.");
  }

  protected static placeFromInventory(player: Player, action: ItemStackAction): void {
    const count = action.count;

    if (!count) throw new Error("Invalid count.");

    const sourceSlot = action.source?.slot;
    const destinationSlot = action.destination?.slot;

    if (sourceSlot === undefined || destinationSlot === undefined) throw new Error("Invalid source or destination slot.");

    // Get the source and destination containers.
    const { container: source } =
      action.source?.type == ContainerName.Armor ? player.getComponent("minecraft:armor") : player.getComponent("minecraft:inventory");
    const destination =
      action.destination?.type == ContainerName.Armor
        ? player.getComponent("minecraft:armor").container
        : action.destination?.type === ContainerName.Cursor
          ? player.getComponent("minecraft:cursor").container
          : player.openedContainer;

    // Check if the source and destination containers exist.
    if (source === null || destination === null) throw new Error("Invalid source or destination.");

    // Get the source and destination items.
    const sourceItem = source.getItem(action.source?.slot ?? 0);
    const destinationItem = destination.getItem(action.destination?.slot ?? 0);

    // Check if the source item exists.
    if (!sourceItem) throw new Error("Invalid source item.");

    // WHY MOJANG??????????
    if (action.destination?.type === ContainerName.Container) {
      process.nextTick(() => {
        const { container } = player.getComponent("minecraft:cursor");

        container.clearSlot(0);
      });
    }

    if (count <= sourceItem.amount) {
      const item = source.takeItem(sourceSlot, count);

      if (!item) throw new Error("Invalid item.");

      if (destinationItem) {
        destinationItem.increment(item.amount);
      } else {
        destination.setItem(destinationSlot, item);
      }
    } else throw new Error("Invalid count possible.");
  }

  /* protected static placeFromArmor(player: Player, action: ItemStackAction): void {
    const count = action.count;

    if (!count) throw new Error("Invalid count.");
    const sourceSlot = action.source?.slot;
    const destinationSlot = action.destination?.slot;

    if (sourceSlot === undefined || destinationSlot === undefined) throw new Error("Invalid source or destination slot.");
    console.warn(sourceSlot, destinationSlot, ContainerName[action.source!.slot], ContainerName[action.destination!.slot]);

    // Get the source and destination containers.
    const { container: source } = player.getComponent("minecraft:armor");
    const destination =
      action.destination?.type === ContainerName.Cursor ? player.getComponent("minecraft:cursor").container : player.openedContainer;

    // Check if the source and destination containers exist.
    if (!source || !destination) throw new Error("Invalid source or destination.");
    // Get the source item and check if exists
    const sourceItem = source.getItem(action.source?.slot ?? 0);

    if (!sourceItem) throw new Error("Invalid source item.");

    // WHY MOJANG??????????
    if (action.destination?.type === ContainerName.Container) {
      process.nextTick(() => {
        const { container } = player.getComponent("minecraft:cursor");

        container.clearSlot(0);
      });
    }

    if (count <= sourceItem.amount) {
      const item = source.takeItem(sourceSlot, count);

      if (!item) throw new Error("Invalid item.");
      destination.setItem(destinationSlot, item);
    } else throw new Error("Invalid count possible.");
  } */

  protected static placeFromCursor(player: Player, action: ItemStackAction): void {
    // Get the item count from the action.
    const count = action.count;

    // Check if the count exists.
    if (!count) throw new Error("Invalid count.");

    // Get the source and destination slots.
    const sourceSlot = action.source?.slot;
    const destinationSlot = action.destination?.slot;

    // Check if the source and destination slots exist.
    if (sourceSlot === undefined || destinationSlot === undefined) throw new Error("Invalid source or destination slot.");

    // Get the source and destination containers.
    const { container: source } = player.getComponent("minecraft:cursor");
    const destination =
      action.destination?.type === ContainerName.Armor
        ? player.getComponent("minecraft:armor").container
        : action.destination?.type === ContainerName.Hotbar ||
            action.destination?.type === ContainerName.Inventory ||
            action.destination?.type === ContainerName.HotbarAndInventory
          ? player.getComponent("minecraft:inventory").container
          : player.openedContainer;

    // Check if the source and destination containers exist.
    if (source === null || destination === null) throw new Error("Invalid source or destination.");

    // Get the destination item.
    const sourceItem = source.getItem(0);
    const destinationItem = destination.getItem(action.destination?.slot ?? 0);

    // Check if the source item exists.
    if (!sourceItem) throw new Error("Invalid source item.");

    // Check if the count is less than or equal to the source item amount.
    if (count <= sourceItem.amount) {
      // Take the item from the source.
      const item = source.takeItem(sourceSlot, count);

      // Check if the item exists.
      if (!item) throw new Error("Invalid item.");

      // Check if the destination item exists.
      if (destinationItem) {
        destinationItem.increment(item.amount);
      } else {
        destination.setItem(destinationSlot, item);
      }
    } else throw new Error("Invalid count possible.");
  }

  protected static handleDestroyAction(player: Player, action: ItemStackAction): void {
    // Get the source.
    const source = action.source;

    if (!source) return;

    // Check if the source is the cursor.
    if (source.type === ContainerName.Cursor) {
      // Get the cursor component.
      const cursor = player.getComponent("minecraft:cursor");

      // Clear the cursor.
      cursor.container.clearSlot(0);
    } else {
      // Get the inventory component
      const inventory = player.getComponent("minecraft:inventory");

      // Clear the source.
      inventory.container.clearSlot(source.slot);
    }
  }

  protected static handleCreativeSelectAction(player: Player, action: ItemStackAction, descriptor: NetworkItemInstanceDescriptor): void {
    // Get the destination.
    const destination = action.destination;

    // Check if the destination exists.
    if (!destination) return;

    // Get the destination container.
    const destinationContainer =
      destination?.type === ContainerName.Armor
        ? player.getComponent("minecraft:armor").container
        : destination.type === ContainerName.Cursor
          ? player.getComponent("minecraft:cursor").container
          : destination.type === ContainerName.Inventory ||
              destination.type === ContainerName.Hotbar ||
              destination.type === ContainerName.HotbarAndInventory
            ? player.getComponent("minecraft:inventory").container
            : player.openedContainer;

    // Check if the destination container exists.
    if (!destinationContainer) return;

    // Get the destination item.
    const destinationItem = destinationContainer.getItem(destination.slot);

    // Check if the destination item exists.
    if (destinationItem) {
      // Add the count to the destination item.
      destinationItem.amount += action.count ?? 0;
    } else {
      // Create the item stack from the descriptor.
      const item = ItemStack.fromNetworkInstance(descriptor);

      // Check if the item exists.
      if (!item) return;

      // Set the amount of the item.
      item.amount = action.count ?? 1;

      // Set the item in the destination container.
      destinationContainer.setItem(destination.slot, item);
    }
  }
}

export { ItemStackRequest };
