import { MINECRAFT_VERSION, PROTOCOL_VERSION } from "@serenityjs/protocol";

import type { World } from "../../world";

const register = (world: World) => {
	// Register the about command
	world.commands.register("about", "Show information about the server", () => {
		// Create the reply message
		const message = `This server is running on SerenityJS for Minecraft: Bedrock Edition v${MINECRAFT_VERSION} (Protocol ${PROTOCOL_VERSION})`;

		// Return the message
		return {
			message
		};
	});
};

export default register;
