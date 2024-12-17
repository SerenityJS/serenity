import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";

import { Serenity } from "../serenity";

class ConsoleInterface {
  protected readonly serenity: Serenity;

  public readonly interface = createInterface({
    input: stdin,
    output: stdout,
    terminal: true
  });

  public constructor(serenity: Serenity) {
    this.serenity = serenity;

    stdin.setRawMode(true);
    stdin.resume();

    this.interface.on("line", this.onLine.bind(this));

    this.interface.setPrompt("> ");
  }

  protected async onLine(line: string): Promise<void> {
    // Check if the line starts with a /
    // If so, slice the line and execute the command
    const format = line.startsWith("/") ? line.slice(1) : line;

    // Parse the flags from the command
    const { command, flags } = this.parseFlags(format);

    // Check if a dimension flag and world flag are present
    const dimensionFlag = flags.find(([key]) => key === "dim");
    const worldFlag = flags.find(([key]) => key === "world");

    if (worldFlag && !dimensionFlag) {
      // Get the world from the world flag
      const world = this.serenity.worlds.get(worldFlag[1]);

      // Check if the world exists
      if (!world) {
        // Log the error to the console
        this.serenity.logger.error("The specified world does not exist");

        return;
      }

      // Get the default dimension of the world
      const dimension = world.getDimension();

      // Attempt to execute the command
      try {
        // Execute the command
        const execute = await dimension.executeCommandAsync(command);

        // Check if the command is undefined
        if (!execute.message) return;

        // Log the command to the console
        world.logger.info(`§a${execute.message}§r`);
      } catch (reason) {
        // Cast the reason to an error
        const error = reason as Error;

        // Log the error to the console
        world.logger.error(error.message);
      }
    } else if (dimensionFlag && !worldFlag) {
      // Log the error to the console
      this.serenity.logger.error(
        "You must specify a world flag when specifying a dimension flag"
      );

      return;
    } else if (dimensionFlag && worldFlag) {
      // Get the world from the world flag
      const world = this.serenity.worlds.get(worldFlag[1]);

      // Check if the world exists
      if (!world) {
        // Log the error to the console
        this.serenity.logger.error("The specified world does not exist");

        return;
      }

      // Get the dimension from the dimension flag
      const dimension = world.getDimension(dimensionFlag[1]);

      // Check if the dimension exists
      if (!dimension) {
        // Log the error to the console
        this.serenity.logger.error("The specified dimension does not exist");

        return;
      }

      // Attempt to execute the command
      try {
        // Execute the command
        const execute = await dimension.executeCommandAsync(command);

        // Check if the command is undefined
        if (!execute.message) return;

        // Log the command to the console
        world.logger.success(`${execute.message}§r`);
      } catch (reason) {
        // Cast the reason to an error
        const error = reason as Error;

        // Log the error to the console
        world.logger.error(error.message);
      }
    } else {
      // Get the default world of the serenity instance
      const world = this.serenity.getWorld();

      // Get the default dimension of the world
      const dimension = world.getDimension();

      // Attempt to execute the command
      try {
        // Execute the command
        const execute = await dimension.executeCommandAsync(command);

        // Check if the command is undefined
        if (!execute.message) return;

        // Log the command to the console
        world.logger.info(`§a${execute.message}§r`);
      } catch (reason) {
        // Cast the reason to an error
        const error = reason as Error;

        // Log the error to the console
        world.logger.error(error.message);
      }
    }
  }

  public parseFlags(command: string): {
    command: string;
    flags: Array<[string, string]>;
  } {
    // Example: /setblock 0 100 0 stone --dim=overworld --world=test123
    const flags = command
      .split("--")
      .slice(1)
      .map((flag) => {
        // Split the flag by the equals sign
        // eslint-disable-next-line prefer-const
        let [key, value] = flag.split("=");

        // Check if there is a space after the value
        // If so, slice the value
        if (value?.endsWith(" ")) {
          // Get the index of the space
          const index = value.indexOf(" ");

          // Slice the value
          value = value.slice(0, index);
        }

        // Return the key and value
        return [key, value];
      }) as Array<[string, string]>;

    const newCommand = command.split("--")?.[0]?.trim() ?? command;

    return { command: newCommand, flags };
  }
}

export { ConsoleInterface };
