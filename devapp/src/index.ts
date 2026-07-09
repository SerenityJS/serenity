import { Serenity, LevelDBProvider, NetworkBound } from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";
import { Packet } from "@serenityjs/protocol";

// Create a new Serenity instance
const serenity = new Serenity({
  path: "./properties.json",
  serenity: {
    permissions: "./permissions.json",
    debugLogging: true
  }
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start().catch((reason) => {
  serenity.logger.error("Failed to start SerenityJS server:", reason);
});

serenity.network.on("all", ({ bound, packet }) => {
  if (bound !== NetworkBound.Client) return;

  if (packet.getId() === Packet.LevelChunk) return;
  if (packet.getId() === Packet.NetworkChunkPublisherUpdate) return;
  if (packet.getId() === Packet.BossEvent) return;

  console.log(`sending packet ${Packet[packet.getId()]} to client`);
});
