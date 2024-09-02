import { CommandPermissionLevel } from "@serenityjs/protocol";
import { StringEnum } from "@serenityjs/command";

import type { World } from "@serenityjs/world";
import type { Serenity } from "../../serenity";

const register = (world: World, serenity: Serenity) => {
	// ? Register the plugin reload command
	world.commands.register(
		"reload",
		"Reloads all the server plugins",
		(_, parameter) => {
			const pluginName = parameter.pluginName.result;

			// ? Iterate through all the server plugins
			const plugin = serenity.plugins.get(pluginName);

			if (!plugin)
				return {
					message: `§4Unknow plugin: ${pluginName}`
				};
			if (!plugin.reloadable) {
				return {
					message: `§4Plugin ${pluginName} is not reloadable`
				};
			}
			void serenity.plugins.reload(pluginName, serenity);

			return {
				message: `§aReloaded plugin ${pluginName}`
			};
		},
		{
			pluginName: StringEnum
		},
		{
			permission: CommandPermissionLevel.Internal
		}
	);
};

export default register;
