const PLUGIN_TEMPLATE = /* typescript */ `import { serenity } from "@serenityjs/serenity"

// We will welcome players when they join the server!
serenity.on("PlayerSpawned", (data) => {
  // Get the player object from the data
  const player = data.player

  // Send a message to the player
  player.sendMessage("Welcome to the server!")
})
`;

export { PLUGIN_TEMPLATE };
