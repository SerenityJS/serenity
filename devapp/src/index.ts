import {
  Serenity,
  LevelDBProvider,
  WorldEvent,
  ActionForm
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

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();

serenity.after(WorldEvent.EntitySpawned, async ({ entity }) => {
  if (!entity.isPlayer()) return;

  const form = new ActionForm("Test Form", "This is a test action form.");
  form.header("Welcome Player");
  form.divider();
  form.button("Click Me", { type: "path", data: "textures/ui/icon_book" });
  form.label("This is a label element.");
  const result = await form.show(entity);

  console.log(result);
});
