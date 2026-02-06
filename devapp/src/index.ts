import {
  Serenity,
  LevelDBProvider,
  WorldEvent,
  Player
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";
import {
  ClientboundDataDrivenUIShowScreenPacket,
  ClientboundDataStorePacket,
  DataStoreChangeInfoEntry,
  DataStoreChangeOptions
} from "@serenityjs/protocol";

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
    packet.screenId = "minecraft:custom_form";
    packet.data = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00]);

    origin.send(packet);

    const packetDataStore = new ClientboundDataStorePacket();
    const update = new DataStoreChangeInfoEntry(
      DataStoreChangeOptions.createSetProperty(
        "minecraft",
        "custom_form_data",
        {
          closeButton: { button_visible: true, label: "Close", onClick: 0 },
          layout: {
            "0": { spacer_visible: true, visible: true },
            "1": {
              label: "Search Bar: ",
              text: "",
              textfield_visible: true,
              visible: true
            },
            "2": { spacer_visible: true, visible: true },
            "3": {
              button_visible: true,
              label: "hello world",
              onClick: 1,
              visible: true
            },
            "4": {
              button_visible: true,
              label: "yooo",
              onClick: 0,
              visible: true
            },
            length: 5
          },
          title: "Game Settings"
        }
      )
    );
    packetDataStore.updates = [update];

    origin.send(packetDataStore);

    let i = 0;
    setInterval(() => {
      (
        update.value as unknown as Record<string, Record<string, string>>
      ).value.title = "Title: " + i++;
      origin.send(packetDataStore);
    }, 50);
  });
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();
