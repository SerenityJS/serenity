import {
  Serenity,
  LevelDBProvider,
  WorldEvent,
  Player,
  PlayerLevelingTrait
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";

// Create a new Serenity instance
const serenity = new Serenity({
  path: "./properties.json",
  serenity: {
    permissions: "./permissions.json",
    debugLogging: true
  }
});

serenity.on(WorldEvent.WorldInitialize, ({ world }) => {
  world.commandPalette.register("test", "", ({ origin }) => {
    if (!(origin instanceof Player)) return;

    const leveling = origin.getTrait(PlayerLevelingTrait);

    const currentLevel = leveling.getExperience();

    leveling.setExperience(currentLevel + 0.1);
  });
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();
