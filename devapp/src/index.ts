import { Serenity, LevelDBProvider, WorldEvent } from "@serenityjs/core";

import { DebugStatsTrait } from "./debug-stats";

const serenity = new Serenity({
  port: 19142,
  debugLogging: true
});

serenity.start();

serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

const world = serenity.getWorld();

world.entityPalette.registerTrait(DebugStatsTrait);

world.on(WorldEvent.PlayerUseItem, ({ player, itemStack }) => {
  player.sendMessage(`You used ${itemStack.type.identifier}`);
});
