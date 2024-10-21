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
  ItemUseOptions,
  EntityIdentifier,
  StringEnum,
  Command
} from "@serenityjs/core";
import {
  CommandPermissionLevel,
  InteractActions,
  Packet
} from "@serenityjs/protocol";

const serenity = new Serenity({ port: 19142, debugLogging: true });

serenity.start();

serenity.registerProvider(InternalProvider);

const world = serenity.createWorld(InternalProvider, {
  identifier: "test123"
}) as World;

const world2 = serenity.createWorld(InternalProvider, {
  identifier: "bean"
}) as World;

// world.itemPalette.clearCreativeContent();
world.itemPalette.registerCreativeContent(
  ItemType.get("minecraft:lava" as keyof Items)!
);

const _overworld = world.createDimension(SuperflatGenerator) as Dimension;
const _overworld2 = world2.createDimension(SuperflatGenerator) as Dimension;

serenity.network.on(Packet.Interact, (data) => {
  if (data.packet.action !== InteractActions.OpenInventory) return;

  const player = serenity.getPlayerByConnection(data.connection) as Player;

  const inventory = player.getTrait(EntityInventoryTrait);

  inventory.container.show(player);
});

class CustomPlayerTrait extends PlayerTrait {
  public static readonly identifier = "custom:player";

  public static readonly types = [EntityIdentifier.Player];

  public onSpawn(): void {
    // this.player.op();
    // this.player.setGamemode(1);
  }

  public onChat(message: string): boolean {
    if (message === "op") {
      this.player.op();
      this.player.sendMessage("You have been opped!");

      return false;
    }

    if (message === "deop") {
      this.player.deop();
      this.player.sendMessage("You have been deopped!");

      return false;
    }

    return true;
  }
}

world.entityPalette.registerTrait(CustomPlayerTrait);
const command = world.commands.register(
  "test",
  "test command",
  (registry) => {
    registry.permissionLevel = CommandPermissionLevel.Operator;

    registry.overload(
      {
        message: StringEnum
      },
      (context) => {
        const world = serenity.getWorld(context.message.result as string);

        if (!world) throw new Error("World not found");

        const player = context.origin as Player;

        player.teleport(player.position, world.getDimension());
      }
    );
  },
  () => new Error("Command not implemented")
);

world2.commands.commands.set("test", command as Command<unknown>);
