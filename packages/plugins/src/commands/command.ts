import { relative } from "path";

import { World, CommandRegistry } from "@serenityjs/core";

import { Pipeline } from "../pipeline";

import { PluginsEnum } from "./enum";

const register = (world: World, pipeline: Pipeline) => {
  world.commandPalette.register(
    "plugins",
    "Interact with the plugins of the server",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      // Register the "list" subcommand
      registry.registerSubCommand(
        "list",
        "List all loaded plugins",
        () => {
          // Check if the pipeline has no plugins
          if (pipeline.plugins.size === 0)
            return {
              message: "§cThere are currently no plugins loaded on the server."
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
        },
        ["l"]
      );

      // Register the "reload" subcommand
      registry.registerSubCommand(
        "reload",
        "Reload a specific plugin",
        (subRegistry: CommandRegistry) => {
          subRegistry.overload(
            {
              plugin: PluginsEnum
            },
            ({ plugin }) => {
              // Get the plugin from the pipeline
              const pluginInstance = pipeline.plugins.get(
                plugin.result as string
              );

              // Check if the plugin is not found
              if (!pluginInstance)
                throw new Error(`Plugin ${plugin.result} is not found.`);

              // Reload the plugin
              pipeline.reload(pluginInstance);

              // Send the message to the origin
              return {
                message: `§aSuccessfully reloaded §2${pluginInstance.identifier}§a.`
              };
            }
          );
        },
        () => {
          throw new Error("No overload matched the provided arguments.");
        },
        ["r"]
      );

      // Register the "bundle" subcommand
      registry.registerSubCommand(
        "bundle",
        "Bundle a specific plugin",
        (subRegistry: CommandRegistry) => {
          subRegistry.overload(
            {
              plugin: PluginsEnum
            },
            ({ plugin }) => {
              // Get the plugin from the pipeline
              const pluginInstance = pipeline.plugins.get(
                plugin.result as string
              );

              // Check if the plugin is not found
              if (!pluginInstance)
                throw new Error(`Plugin ${plugin.result} is not found.`);

              // Check if the plugin is already bundled
              if (pluginInstance.isBundled)
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
          );
        },
        () => {
          throw new Error("No overload matched the provided arguments.");
        },
        ["b"]
      );
    },
    () => {
      throw new Error("No subcommand matched the provided arguments.");
    },
    ["pl", "plugin"] // Command aliases
  );
};

export default register;
