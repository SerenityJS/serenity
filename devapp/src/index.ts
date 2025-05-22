import {
  Serenity,
  LevelDBProvider,
  WorldEvent,
  Player,
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";

// Create a new Serenity instance
const serenity = new Serenity({
  path: "./properties.json",
  serenity: {
    permissions: "./permissions.json",
    resources: "./resource_packs",
    debugLogging: true,
  },
});

serenity.before(WorldEvent.WorldInitialize, ({ world }) => {
  world.commandPalette.register("toast", "test the toast", ({ origin }) => {
    if (!(origin instanceof Player)) return;
    origin.onScreenDisplay.setToast("title", "test");
  });
  return true;
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();
