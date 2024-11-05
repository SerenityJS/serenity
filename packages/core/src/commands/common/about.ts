import { MINECRAFT_VERSION, PROTOCOL_VERSION } from "@serenityjs/protocol";

import type { World } from "../../world";

const register = (world: World) => {
  world.commands.register("about", "Get information about the server", () => {
    return {
      message: `§7This server is running §uSerenityJS§7 for Minecraft Bedrock Edition. §8(v${MINECRAFT_VERSION}, proto-v${PROTOCOL_VERSION})§r`
    };
  });
};

export default register;
