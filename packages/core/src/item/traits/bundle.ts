import { IntTag } from "@serenityjs/nbt";
import {
  ContainerId,
  ContainerName,
  ContainerType,
  FullContainerName,
  InventoryContentPacket,
  NetworkItemStackDescriptor
} from "@serenityjs/protocol";

import { ItemIdentifier } from "../../enums";
import { ItemStack } from "../stack";
import { Player } from "../../entity";
import { Container } from "../../container";

import { ItemTrait } from "./trait";

class ItemBundleTrait<T extends ItemIdentifier> extends ItemTrait<T> {
  public static readonly identifier = "dynamic_container";

  public static readonly types = [
    ItemIdentifier.Bundle,
    ItemIdentifier.BlueBundle,
    ItemIdentifier.BlackBundle,
    ItemIdentifier.BrownBundle,
    ItemIdentifier.CyanBundle,
    ItemIdentifier.GrayBundle,
    ItemIdentifier.GreenBundle,
    ItemIdentifier.LightBlueBundle,
    ItemIdentifier.LightGrayBundle,
    ItemIdentifier.LimeBundle,
    ItemIdentifier.MagentaBundle,
    ItemIdentifier.OrangeBundle,
    ItemIdentifier.PinkBundle,
    ItemIdentifier.PurpleBundle,
    ItemIdentifier.RedBundle,
    ItemIdentifier.WhiteBundle,
    ItemIdentifier.YellowBundle
  ];

  /**
   * The container of the item.
   */
  public readonly container: Container;

  public constructor(item: ItemStack<T>) {
    super(item);

    // Check if the item has a bundle id.
    if (!item.components.has("dynamic_container")) {
      // Generate a new bundle id.
      const id = Math.abs(Date.now() >> 4) + Math.floor(Math.random() * 32);

      // Set the bundle id component and nbt.
      item.components.set("dynamic_container", id);

      // Create a new int tag for the bundle id.
      const tag = new IntTag({ name: "bundle_id", value: id });

      // Set the bundle id nbt.
      item.nbt.set("bundle_id", tag);
    } else {
      // Get the bundle id.
      const id = item.components.get("dynamic_container") as number;

      // Create a new int tag for the bundle id.
      const tag = new IntTag({ name: "bundle_id", value: id });

      // Set the bundle id nbt.
      item.nbt.set("bundle_id", tag);
    }

    // Create a new container.
    this.container = new Container(
      ContainerType.None,
      ContainerId.Registry,
      64
    );
  }

  /**
   * The bundle id of the item.
   */
  public get dynamicId(): number {
    // Return the bundle id.
    return (this.item.components.get("dynamic_container") as number) ?? 0;
  }

  /**
   * Sets the bundle id of the item.
   */
  public set dynamicId(id: number) {
    // Set the bundle id.
    this.item.components.set("dynamic_container", id);

    // Create a new int tag for the bundle id.
    const tag = new IntTag({ name: "bundle_id", value: id });

    // Set the bundle id nbt.
    this.item.nbt.set("bundle_id", tag);
  }

  public onContainerOpen(player: Player): void {
    // Add the player to the occupants of the container.
    this.container.occupants.add(player);
  }

  public onContainerClose(player: Player): void {
    // Remove the player from the occupants of the container.
    this.container.occupants.delete(player);
  }

  public onTick(): void {
    // Get the current tick of the world.
    const currentTick = this.item.world.currentTick;

    // Check if there are no occupants in the container.
    // And the current tick is divisible by 5.
    if (this.container.occupants.size === 0 || currentTick % 5n !== 0n) return;

    // Send the items in the bundle to the player.
    // Create a new InventoryContentPacket.
    const packet = new InventoryContentPacket();
    packet.containerId = ContainerId.Registry;
    packet.storageItem = ItemStack.toNetworkStack(this.item);
    packet.fullContainerName = new FullContainerName(
      ContainerName.Dynamic,
      this.dynamicId
    );

    // Prepare the items in the bundle.
    packet.items = [];

    // Push the item stacks to the packet.
    const items = Array.from(this.container.storage);
    for (let i = 0; i < this.container.size; i++) {
      // Get the item stack from the bundle.
      const stack = items[i];

      // Check if the item stack exists.
      // If not, push an empty item stack.
      if (!stack) packet.items.push(new NetworkItemStackDescriptor(0));
      // Push the item stack to the packet.
      else packet.items.push(ItemStack.toNetworkStack(stack));
    }

    // Send the packet to the occupants of the container.
    for (const occupant of this.container.occupants) occupant.send(packet);
  }
}

export { ItemBundleTrait };
