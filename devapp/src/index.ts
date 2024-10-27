import {
  Serenity,
  InternalProvider,
  Player,
  LevelDBProvider,
  WorldEvent,
  BlockIdentifier
} from "@serenityjs/core";
import { Packet } from "@serenityjs/protocol";

import { DebugStatsTrait } from "./debug-stats";

const serenity = new Serenity({
  port: 19132,
  debugLogging: true
});

serenity.start();

serenity.registerProvider(InternalProvider);
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

const world = serenity.getWorld();

world.on(WorldEvent.EntitySpawned, ({ entity }) => {
  console.log(entity);
});

serenity.before(WorldEvent.PlayerPlaceBlock, (event) => {
  const permutation = event.permutationBeingPlaced;

  if (permutation.type.identifier === BlockIdentifier.Cobblestone) return false;

  return true;
});

serenity.before(WorldEvent.PlayerBreakBlock, (event) => {
  const block = event.block;

  if (block.getType().identifier === BlockIdentifier.Dirt) return false;

  return true;
});

world.entityPalette.registerTrait(DebugStatsTrait);

world.commands.register("stop", "", (context) => {
  if (!(context.origin instanceof Player)) return;

  serenity.stop();

  return { message: "World saved!" };
});

world.commands.register("test", "", (context) => {
  if (!(context.origin instanceof Player)) return;

  console.log(context.origin.device);
});

serenity.network.on(Packet.PacketViolationWarning, ({ packet }) =>
  console.log(packet)
);
