import {
  Serenity,
  InternalProvider,
  Dimension,
  Player,
  SuperflatGenerator,
  PlayerTrait,
  BlockPermutation,
  BlockIdentifier,
  EntityNameTagTrait,
  World
} from "@serenityjs/core";
import { Packet } from "@serenityjs/protocol";

const serenity = new Serenity({ port: 19142, debugLogging: true });

serenity.network.raknet.message = "2";

serenity.start();

serenity.registerProvider(InternalProvider);

const world = serenity.createWorld(InternalProvider, {
  identifier: "test123"
}) as World;

const _overworld = world.createDimension(SuperflatGenerator) as Dimension;

serenity.network.after(Packet.Login, (data) => {
  const player = serenity.getPlayerByConnection(data.connection) as Player;

  // player.abilities.set(AbilityIndex.MayFly, true);
});

serenity.network.before(Packet.SetLocalPlayerAsInitialized, (data) => {
  const player = serenity.getPlayerByConnection(data.connection) as Player;

  player.addTrait(CustomTrait);

  return true;
});

serenity.network.before(Packet.Text, (data) => {
  const player = serenity.getPlayerByConnection(data.connection) as Player;

  const trait = player.getTrait(EntityNameTagTrait);

  switch (data.packet.message) {
    case "on":
      trait.setVisibility(true);
      break;

    case "off":
      trait.setVisibility(false);
      break;

    case "set":
      trait.setNameTag(data.packet.message.replace("set ", ""));
      break;
  }

  console.log(trait.getNameTag());
  console.log(trait.getVisibility());

  return true;
});

serenity.network.on(Packet.PacketViolationWarning, (data) => {
  console.log(data.packet);
});

class CustomTrait extends PlayerTrait {
  public static readonly identifier = "custom_trait";

  public onTick(): void {
    const position = this.player.position.floor();
    const block = this.player.dimension.getBlock({ ...position, y: -60 });

    block.setPermutation(
      BlockPermutation.resolve(BlockIdentifier.DiamondBlock)
    );
  }
}
