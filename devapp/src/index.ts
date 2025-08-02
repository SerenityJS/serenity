import { Serenity, LevelDBProvider, WorldEvent } from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";
import { Packet } from "@serenityjs/protocol";

// Create a new Serenity instance
const serenity = new Serenity({
  path: "./properties.json",
  serenity: {
    permissions: "./permissions.json",
    resources: "./resource_packs",
    debugLogging: true
  }
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();

serenity.on(WorldEvent.PlayerJoin, () => {});
