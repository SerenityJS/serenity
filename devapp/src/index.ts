import {
  Serenity,
  InternalProvider,
  Dimension,
  Player,
  SuperflatGenerator,
  PlayerTrait,
  BlockPermutation,
  BlockIdentifier,
  World,
  ItemStack,
  ItemIdentifier,
  EntityInventoryTrait,
  ItemType,
  Items,
  ItemTrait,
  ItemUseOptions
} from "@serenityjs/core";
import { InteractActions, Packet } from "@serenityjs/protocol";

const serenity = new Serenity({ port: 19142, debugLogging: true });

serenity.start();

serenity.registerProvider(InternalProvider);

const world = serenity.createWorld(InternalProvider, {
  identifier: "test123"
}) as World;

// world.itemPalette.clearCreativeContent();
world.itemPalette.registerCreativeContent(
  ItemType.get("minecraft:lava" as keyof Items)!
);

const _overworld = world.createDimension(SuperflatGenerator) as Dimension;

serenity.network.before(Packet.Text, (data) => {
  const player = serenity.getPlayerByConnection(data.connection) as Player;

  const stack = new ItemStack(ItemIdentifier.Cobblestone, { amount: 1 });

  new CustomItem(stack);

  stack.nbt.createIntTag("Damage", 0);

  player.dimension.spawnItem(stack, player.position);

  return true;
});

serenity.network.on(Packet.PacketViolationWarning, (data) => {
  console.log(data.packet);
});

serenity.network.on(Packet.Interact, (data) => {
  if (data.packet.action !== InteractActions.OpenInventory) return;

  const player = serenity.getPlayerByConnection(data.connection) as Player;

  const inventory = player.getTrait(EntityInventoryTrait);

  inventory.container.show(player);
});

serenity.network.on(Packet.CommandRequest, (data) => {
  const player = serenity.getPlayerByConnection(data.connection) as Player;

  const inventory = player.getTrait(EntityInventoryTrait);

  const item = new ItemStack(ItemIdentifier.DiamondSword);

  inventory.container.addItem(item);
});

class CustomItem extends ItemTrait<ItemIdentifier.Cobblestone> {
  public static readonly identifier = "custom:item";

  public onUse(player: Player, options: Partial<ItemUseOptions>): boolean {
    console.log(
      "Item used!",
      options.method,
      options.predictedDurability,
      options.targetBlock?.position
    );

    return true;
  }

  public onStartUse(player: Player, options: Partial<ItemUseOptions>): void {
    console.log("Item started to be used!");
  }

  public onStopUse(player: Player, options: Partial<ItemUseOptions>): void {
    console.log("Item stopped being used!");
  }
}

// setInterval(() => console.log(serenity.tps), 250);
