import {
  Serenity,
  LevelDBProvider,
  Observable,
  WorldEvent,
  Player,
  CustomForm
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";

const test = new Observable<string>("test");

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

    const form = new CustomForm(test).closeButton();
    form.divider();
    form.spacer();

    form.button("Click Me!", (player) =>
      player.onScreenDisplay.setToast("DDUI", "Button clicked!")
    );

    form.spacer();
    form.divider();

    form.label("Label Test");

    form.show(origin);
  });
});

serenity.on(WorldEvent.WorldTick, ({ currentTick }) =>
  test.setValue("Current tick: " + currentTick.toString())
);

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();
