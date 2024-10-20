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
  BlockTrait,
  Block
} from "@serenityjs/core";
import {
  InteractActions,
  Packet,
  PlayerActionType
} from "@serenityjs/protocol";

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

  const stack = new ItemStack(ItemIdentifier.DiamondSword);
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

// setInterval(() => console.log(serenity.tps), 250);
