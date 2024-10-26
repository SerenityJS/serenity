import {
  Serenity,
  InternalProvider,
  Player,
  ItemStack,
  ItemIdentifier,
  EntityInventoryTrait,
  LevelDBProvider,
  ItemTrait,
  TargetEnum,
  PlayerTrait,
  EntityIdentifier,
  BlockTrait,
  BlockIdentifier,
  ItemType,
  ItemBundleTrait
} from "@serenityjs/core";
import {
  ActorDataId,
  ActorDataType,
  ActorFlag,
  ContainerId,
  ContainerName,
  ContainerOpenPacket,
  ContainerType,
  DataItem,
  FullContainerName,
  InventoryContentPacket,
  ItemInstanceUserData,
  NetworkItemStackDescriptor,
  Packet
} from "@serenityjs/protocol";
import { CompoundTag, IntTag } from "@serenityjs/nbt";

import { DebugStatsTrait } from "./debug-stats";

const serenity = new Serenity({ port: 19142, debugLogging: true });

serenity.start();

serenity.registerProvider(InternalProvider);
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

const world = serenity.getWorld();

world.entityPalette.registerTrait(DebugStatsTrait);

world.commands.register("stop", "", (context) => {
  if (!(context.origin instanceof Player)) return;

  serenity.stop();

  return { message: "World saved!" };
});

world.commands.register("test", "", (context) => {
  if (!(context.origin instanceof Player)) return;

  const stack = new ItemStack(ItemIdentifier.BlueBundle);

  stack.addTrait(ItemBundleTrait);
  const bundle = stack.getTrait(ItemBundleTrait);

  bundle.container.addItem(new ItemStack(ItemIdentifier.Diamond));
  bundle.container.addItem(new ItemStack(ItemIdentifier.IronIngot));
  bundle.container.addItem(new ItemStack(ItemIdentifier.GoldIngot));

  context.origin.getTrait(EntityInventoryTrait).container.addItem(stack);

  return { message: "Item created!" };
});

world.commands.register("holding", "", (context) => {
  if (!(context.origin instanceof Player)) return;

  const item = context.origin.getHeldItem();

  console.log(item?.getDataEntry());

  return { message: `Holding: ${item?.type.identifier}` };
});

world.commands.register(
  "invsee",
  "See the inventory of another player",
  (registry) => {
    registry.overload(
      {
        player: TargetEnum
      },
      (context) => {
        if (!(context.origin instanceof Player)) return;

        // @ts-ignore
        const target = context.player?.result[0] as Player;

        const { container } = target.getTrait(EntityInventoryTrait);

        // Create a new ContainerOpenPacket
        const packet = new ContainerOpenPacket();

        context.origin.flags.set(ActorFlag.Chested, true);
        context.origin.metadata.set(
          ActorDataId.ContainerSize,
          new DataItem(
            ActorDataId.ContainerSize,
            ActorDataType.Int,
            container.size
          )
        );

        context.origin.metadata.set(
          ActorDataId.ContainerType,
          new DataItem(
            ActorDataId.ContainerType,
            ActorDataType.Byte,
            ContainerType.Container
          )
        );

        // Assign the properties
        packet.identifier = ContainerId.None;
        packet.type = ContainerType.Container;
        packet.position = container.entity.position;
        packet.uniqueId = container.entity.uniqueId;

        // Send the packet to the player
        context.origin.send(packet);

        context.origin.openedContainer = container;
        container.occupants.add(context.origin);
      }
    );
  },
  () => {}
);

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

class CustomBlockTrait extends BlockTrait {
  public static readonly identifier = "custom_block_trait";

  public static readonly types = [BlockIdentifier.Stone];

  public onInteract(player: Player): void {
    player.sendMessage("Block interacted!");
  }

  public onPlace(player: Player): boolean | void {
    player.sendMessage("Block placed!");
  }
}

world.blockPalette.registerTrait(CustomBlockTrait);
