import { relative } from "path";

import { World } from "@serenityjs/core";
import { CommandPermissionLevel } from "@serenityjs/protocol";

import { Pipeline } from "../pipeline";

import { PluginActionsEnum, PluginsEnum } from "./enum";

const register = (world: World, pipeline: Pipeline) => {
  world.commands.register(
    "plugins",
    "Interact with the plugins of the server",
    (registry) => {
      // Set the command to be an operator command
      registry.permissionLevel = CommandPermissionLevel.Operator;

      // Overload for listing the plugins
      registry.overload(
        {
          action: PluginActionsEnum
        },
        ({ action }) => {
          // Check if the action is list
          if (action.result !== "list") return;

          // Check if the pipeline has no plugins
          if (pipeline.plugins.size === 0)
            return {
              message: "§cThere are current no plugins loaded on the server."
            };

          // Get the plugins from the pipeline
          const plugins = [...pipeline.plugins.values()];

          // Prepare the message
          const message = [];

          // Loop through the plugins
          for (const plugin of plugins) {
            // Push the plugin name to the message
            message.push(`§u${plugin.identifier} v${plugin.version}§r`);
          }

          // Send the message to the origin
          return {
            message: `§7Active Plugins (${plugins.length}):§r ${message.join("§7,§r ")}`
          };
        }
      );

      registry.overload(
        {
          action: PluginActionsEnum,
          plugin: PluginsEnum
        },
        ({ action, plugin }) => {
          // Check if the action is reload
          if (action.result !== "reload" && action.result !== "bundle") return;

          // Get the plugin from the pipeline
          const pluginInstance = pipeline.plugins.get(plugin.result as string);

          // Check if the plugin is not found
          if (!pluginInstance)
            throw new Error(`Plugin ${plugin.result} is not found.`);

          // Check if the action is reload
          if (action.result === "reload") {
            // Reload the plugin
            pipeline.reload(pluginInstance);

            // Send the message to the origin
            return {
              message: `§aSuccessfully reloaded §2${pluginInstance.identifier}§a.`
            };
          } else {
            if (pluginInstance.isBundled)
              // Check if the plugin is already bundled
              throw new Error(
                `Plugin ${pluginInstance.identifier} cannot be bundled, as it is already a bundled plugin.`
              );

            // Bundle the plugin
            pipeline.bundle(pluginInstance);

            // Send the message to the origin
            return {
              message: `§aSuccessfully bundled §2${pluginInstance.identifier}§a, output file was placed at §7${relative(process.cwd(), pipeline.path)}§a.`
            };
          }
        }
      );
    },
    () => {
      throw new Error("No overload matched the provided arguments.");
    }
  );
};

export default register;
