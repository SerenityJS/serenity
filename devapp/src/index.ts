import {
  Serenity,
  LevelDBProvider,
  WorldEvent,
  Player
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";

// Create a new Serenity instance
const serenity = new Serenity({
  port: 19142,
  permissions: "./permissions.json",
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

serenity.on(WorldEvent.WorldInitialize, ({ world }) => {
  world.commands.register("test", "test command", (context) => {
    if (!(context.origin instanceof Player))
      throw new Error("Only players can run this command");

    const player = context.origin;

    player
      .getWorld()
      .createDimension({ identifier: "beans", generator: "nether-superflat" });
  });
});
