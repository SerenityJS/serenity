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
  Command,
  EntityTrait,
  EntityInteractMethod,
  EntityHealthTrait
} from "@serenityjs/core";
import {
  CommandPermissionLevel,
  InteractActions,
  Packet,
  Vector3f
} from "@serenityjs/protocol";

import { DebugStatsTrait } from "./debug-stats";

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
    this.player.op();
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

class CustomCowTrait extends EntityTrait {
  public static readonly identifier = "custom:cow";

  public static readonly types = [EntityIdentifier.Cow];

  public onSpawn(): void {
    console.log("Cow spawned!");
  }

  public onInteract(player: Player, method: EntityInteractMethod): void {
    player.sendMessage(`Moo! ${method}`);
  }
}

world.entityPalette.registerTrait(CustomCowTrait);
world.entityPalette.registerTrait(DebugStatsTrait);

world.commands.register("test", "", () => {
  for (let x = -20; x < 20; x++) {
    for (let z = -20; z < 20; z++) {
      // Check that the x & z are divisible by 5
      if (x % 2 !== 0 || z % 2 !== 0) continue;

      const entity = _overworld.spawnEntity(
        EntityIdentifier.ArmorStand,
        new Vector3f(x, 20, z)
      );

      const health = entity.getTrait(EntityHealthTrait);
      health.currentValue = 5;

      const item = new ItemStack(ItemIdentifier.Diamond, { amount: 32 });
      const inventory = entity.addTrait(EntityInventoryTrait);
      inventory.container.addItem(item);

      // Generate a random velocity from -1 to 1
      const vx = Math.random() * 2 - 1;
      const vy = Math.random() * 2 - 1;
      const vz = Math.random() * 2 - 1;

      entity.setMotion(new Vector3f(vx, vy, vz));
    }
  }
});
