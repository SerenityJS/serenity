import { MINECRAFT_VERSION, PROTOCOL_VERSION } from "@serenityjs/protocol";

import type { World } from "../../world";

const register = (world: World) => {
  world.commandPalette.register(
    "about",
    "Get information about the server.",
    () => {
      // Get the runtime of the server
      const runtime = process.versions.bun === undefined ? "node.js" : "bun.sh";

      return {
        message: `§7This server is running §uSerenityJS§7 for Minecraft Bedrock Edition. §8(v${MINECRAFT_VERSION}, proto-v${PROTOCOL_VERSION}, ${runtime})§r`
      };
    }
  );
};

export default register;
