import { Serenity, LevelDBProvider, WorldEvent } from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";

// Create a new Serenity instance
const serenity = new Serenity({
  path: "./properties.json",
  serenity: {
    permissions: "./permissions.json",
    resourcePacks: "./resource_packs",
    debugLogging: true
  }
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

serenity.on(WorldEvent.PlayerBreakBlock, async (event) => {
  await Promise.all([
    event.player.sendMessage("Delaying block break by 3 seconds..."),
    new Promise((resolve) => setTimeout(resolve, 3000))
  ]);
  await event.player.sendMessage("Block break delayed!");
});

// Register the LevelDBProvider
serenity
  .registerProvider(LevelDBProvider, { path: "./worlds" })
  .then(() => serenity.start())
  .catch((reason) => {
    serenity.logger.error("Failed to start the server:", reason);
    process.exit(1);
  });
