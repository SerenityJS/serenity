import {
  Serenity,
  InternalProvider,
  Dimension,
  Player,
  SuperflatGenerator,
  PlayerTrait,
  World,
  ItemStack,
  ItemIdentifier,
  EntityInventoryTrait,
  ItemType,
  Items,
  EntityIdentifier,
  EntityHealthTrait,
  LevelDBProvider,
  ItemTrait,
  ItemUseOptions
} from "@serenityjs/core";
import {
  DimensionType,
  InteractActions,
  Packet,
  Vector3f
} from "@serenityjs/protocol";

import { DebugStatsTrait } from "./debug-stats";

const serenity = new Serenity({ port: 19142, debugLogging: true });

serenity.start();

serenity.registerProvider(InternalProvider);

serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

try {
  serenity.createWorld(LevelDBProvider, { identifier: "hub" });
} catch {
  //
}

const world = serenity.getWorld();

world.entityPalette.registerTrait(DebugStatsTrait);

world.commands.register("stop", "", (context) => {
  if (!(context.origin instanceof Player)) return;

  serenity.stop();

  return { message: "World saved!" };
});

world.commands.register("test", "", (context) => {
  if (!(context.origin instanceof Player)) return;

  const item = new ItemStack(ItemIdentifier.DiamondBlock, { amount: 64 });

  const { container } = context.origin.getTrait(EntityInventoryTrait);
  container.addItem(item);

  return { message: "Item created!" };
});

world.commands.register("holding", "", (context) => {
  if (!(context.origin instanceof Player)) return;

  const item = context.origin.getHeldItem();

  console.log(item?.getDataEntry());

  return { message: `Holding: ${item?.type.identifier}` };
});

serenity.network.on(Packet.PacketViolationWarning, ({ packet }) =>
  console.log(packet)
);

class CustomItemTrait extends ItemTrait<ItemIdentifier.FlintAndSteel> {
  public static readonly identifier = "custom_trait";

  public static readonly types = [ItemIdentifier.FlintAndSteel];

  public constructor(item: ItemStack<ItemIdentifier.FlintAndSteel>) {
    super(item);
  }

  public onUse(player: Player): void {
    player.getTrait(EntityInventoryTrait).container.show(player);
  }
}

// @ts-ignore
world.itemPalette.registerTrait(CustomItemTrait);
