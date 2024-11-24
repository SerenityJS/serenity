import {
  Serenity,
  LevelDBProvider,
  WorldEvent,
  ItemUseMethod
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";

// Create a new Serenity instance
const serenity = new Serenity({
  port: 19142,
  permissions: "./permissions.json",
  resourcePacks: "./resource_packs",
  debugLogging: true
});

// Create a new plugin pipeline
const pipeline = new Pipeline(serenity, { path: "./plugins" });

// Initialize the pipeline
void pipeline.initialize(() => {
  // Register the LevelDBProvider
  serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

  // Start the server
  serenity.start();
});

serenity.on(WorldEvent.PlayerUseItem, ({ useMethod, player }) => {
  player.sendMessage(ItemUseMethod[useMethod]);
});
