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

serenity.on(WorldEvent.PlayerJoin, ({ player }) => {
  player.setExperience(0);
  player.setLevel(0);
});

serenity.on(WorldEvent.WorldInitialize, ({ world }) => {
  let total = 0;

  world.commandPalette.register("test", "", ({ origin }) => {
    if (!(origin instanceof Player)) return;
    // Generate a random level and experience from 0.0 to 10.0
    const randomLevel = Math.random() * 10;

    origin.addExperience(randomLevel);
    total += randomLevel;

    console.log(total);
  });
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();
