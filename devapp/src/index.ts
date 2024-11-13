import {
  Serenity,
  LevelDBProvider,
  WorldEvent,
  CustomBlockType,
  CustomItemType,
  BlockPermutation,
  CustomEntityType,
  EntityType
} from "@serenityjs/core";
import { CompoundTag, Tag } from "@serenityjs/nbt";
import { Pipeline } from "@serenityjs/plugins";
import { AvailableActorIdentifiersPacket } from "@serenityjs/protocol";

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

const block = new CustomBlockType("serenity:test_block");
BlockPermutation.create(block, {});

const customItem = new CustomItemType("tut:gem", {});

const entity = new CustomEntityType("tut:skele_yaklin");

serenity.on(WorldEvent.WorldInitialize, ({ world }) => {
  world.blockPalette.registerType(block);
  world.itemPalette.registerType(customItem);
  world.entityPalette.registerType(entity);

  // // Get the available actor identifiers
  // const actors = new AvailableActorIdentifiersPacket();
  // actors.data = new CompoundTag();

  // // Map the entities to the packet
  // const entities = world.entityPalette
  //   .getAllCustomTypes()
  //   .map((entity) => EntityType.toNbt(entity));

  // // Create a new list tag for the entities
  // actors.data.createListTag("idlist", Tag.Compound, entities);

  // const buffer = actors.serialize();

  // const a2 = new AvailableActorIdentifiersPacket(buffer).deserialize();

  // console.log(a2.data);

  // const buffer2 = a2.serialize();

  // console.log(buffer);
  // console.log(buffer2);

  // console.log(buffer.equals(buffer2));
});
