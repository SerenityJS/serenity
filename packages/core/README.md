# Introduction
This package contains the fundamental structures and behaviors that define SerenityJS. This package is used in the pre-built server executables that is provided at our [server-binaries](https://github.com/SerenityJS/server-binaries) repository. This package also includes the proper implementations for handling Chunks, Subchunks, BlockTypes, and BlockPermutations for a vanilla formatted world. This package can also be used to create your own minified server software while keeping the stability of Serenity.

## Serenity
Easily integrate a Serenity server into any of your NodeJS/Bun projects while maintaing a high level of control.
```ts
import { Serenity, LevelDBProvider, WorldEvent } from "@serenityjs/core";

// Create a new Serenity instance
const serenity = new Serenity({
  path: "./properties.json",
  serenity: {
    permissions: "./permissions.json",
    resourcePacks: "./resource_packs",
  }
});

// Welcome all players that join
serenity.on(WorldEvent.PlayerInitialized, ({ player }) => {
  player.sendMessage("Welcome to my server!");
});

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();
```

## Events
Serenity has 3 methods for event listening, `before`, `on`, and `after`. Each have a different level of priority.

While using a `before` listener, this method is called before any other listener. You then are able to cancel the remaining loop by simply returning `true` or `false`.
```ts
serenity.before(WorldEvent.PlayerChat, ({ player, message }) => {
  // If false is retured in the function,
  // the loop will be canceled and the message wont be displayed.
  // Meaning 'on' & 'after' listeners will never receive the signal.
  if (message === "cancel") return false;

  // If true is retured in the function,
  // The event loop will continue as usual.
  return true;
});
```

While using a `on` listener, this method is called on the same process tick, but directly after a `before` listener. This listener method cannot be canceled.
```ts
serenity.on(WorldEvent.PlayerPlaceBlock, ({ block, permutationBeingPlaced }) => {
  block.identifier; // Expected value: "minecraft:air"
  permutationBeingPlaced.identifier; // Expected value to be the block type being placed

  assert(block.identifier !== permutationBeingPlaced.identifier) // Expected to be true
});
```

While using a `after` listener, this method is called once all other methods are completed and on the next process tick.
```ts
serenity.on(WorldEvent.PlayerPlaceBlock, ({ block, permutationBeingPlaced }) => {
  block.identifier; // Expected value to be the block type being  placed
  permutationBeingPlaced.identifier; // Expected value to be the block type being placed

  assert(block.identifier === permutationBeingPlaced.identifier) // Expected to be true
});
```