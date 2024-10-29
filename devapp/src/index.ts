import { Serenity, Player, LevelDBProvider } from "@serenityjs/core";

import { DebugStatsTrait } from "./debug-stats";

const serenity = new Serenity({
  port: 19132,
  debugLogging: true
});

serenity.start();

// serenity.registerProvider(InternalProvider);
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

const world = serenity.getWorld();

// world.on(WorldEvent.EntitySpawned, ({ entity }) => {
//   if (!entity.isPlayer()) return;

//   const form = new MessageForm();
//   form.title = "Welcome!";
//   form.content = "Welcome to the server!";
//   form.button1 = "Yes";
//   form.button2 = "No";

//   form.show(entity, (response, error) => {
//     if (response !== null) {
//       console.log("Response:", response);
//     } else {
//       console.error(error);
//     }
//   });
// });

// serenity.before(WorldEvent.PlayerPlaceBlock, (event) => {
//   const permutation = event.permutationBeingPlaced;

//   if (permutation.type.identifier === BlockIdentifier.Cobblestone) return false;

//   return true;
// });

// serenity.before(WorldEvent.PlayerBreakBlock, (event) => {
//   const block = event.block;

//   if (block.getType().identifier === BlockIdentifier.Dirt) return false;

//   return true;
// });

world.entityPalette.registerTrait(DebugStatsTrait);

// world.commands.register("stop", "", (context) => {
//   if (!(context.origin instanceof Player)) return;

//   serenity.stop();

//   return { message: "World saved!" };
// });

world.commands.register("test", "", (context) => {
  if (!(context.origin instanceof Player)) return;

  context.origin.disconnect("You have been disconnected!");
});

// serenity.network.on(Packet.PacketViolationWarning, ({ packet }) =>
//   console.log(packet)
// );

serenity.network.raknet.before("disconnect", (connection) => {
  const player = serenity.getPlayerByConnection(connection);

  console.log(player?.username);

  return true;
});
