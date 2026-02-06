import {
  Serenity,
  LevelDBProvider,
  WorldEvent,
  Player
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";
import { ClientboundDataDrivenUIShowScreenPacket } from "@serenityjs/protocol";

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

    const packet = new ClientboundDataDrivenUIShowScreenPacket();
    packet.screenId = "minecraft:chest_screen";
    packet.data = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00]);

    origin.send(packet);
  });
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();
