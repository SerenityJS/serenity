import {
  Serenity,
  LevelDBProvider,
  WorldEvent,
  Player,
  ItemStack,
  ItemIdentifier,
  EntityInventoryTrait
} from "@serenityjs/core";
import { CompoundTag } from "@serenityjs/nbt";
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
  world.commands.register("test", "", ({ origin }) => {
    if (!(origin instanceof Player)) return;

    const itemStack = new ItemStack(ItemIdentifier.Diamond, { amount: 8 });

    const display = new CompoundTag("display");
    display.createStringTag("Name", "Hello World!");

    itemStack.nbt.set("display", display);

    origin.getTrait(EntityInventoryTrait).container.addItem(itemStack);
  });
});
