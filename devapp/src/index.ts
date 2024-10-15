import {
  Serenity,
  InternalProvider,
  VoidGenerator,
  Dimension,
  Player,
  PlayerChunkRenderingTrait,
  EntityHasGravityTrait,
  SuperflatGenerator
} from "@serenityjs/core";
import { AbilityIndex, Packet } from "@serenityjs/protocol";

const serenity = new Serenity({ port: 19142, debugLogging: true });

serenity.network.raknet.message = "2";

serenity.start();

serenity.registerProvider(InternalProvider);

const world = serenity.createWorld(InternalProvider, { identifier: "test123" });

if (world) {
  const dim = world.createDimension(SuperflatGenerator) as Dimension;
}

serenity.network.after(Packet.Login, (data) => {
  const player = serenity.getPlayerByConnection(data.connection) as Player;

  new PlayerChunkRenderingTrait(player);
  new EntityHasGravityTrait(player);

  player.abilities.set(AbilityIndex.MayFly, true);
});

serenity.network.after(Packet.SetLocalPlayerAsInitialized, (data) => {
  const player = serenity.getPlayerByConnection(data.connection) as Player;

  console.log(player.components);

  // setInterval(() => player.updateAbilities(), 1000);
});
