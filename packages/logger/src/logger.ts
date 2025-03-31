import moment from "moment";

import { formatMinecraftColorCode } from "./minecraft-colors";
import { LoggerColors } from "./logger-colors";

/**
 * A colorized logger for applications.
 */
class Logger {
  /**
   * Whether or not debug messages should be shown.
   */
  public static DEBUG: boolean = false;

  /**
   * The module name of the logger.
   */
  public name: string;

  /**
   * The color of module name.
   */
  public color: LoggerColors;

  /**
   * Constructs a new logger.
   *
   * @param name - The module name.
   * @param color - The color of the module name.
   */
  public constructor(name: string, color: LoggerColors) {
    this.name = name;
    this.color = color;
  }

  /**
   * Logs a message to the console.
   *
   * @param arguments_ - The arguments to log.
   */
  public log(...arguments_: Array<unknown>): void {
    const colorized = this.colorize(...arguments_);
    const format =
      `${LoggerColors.DarkGray + "<"}${LoggerColors.Reset + moment().format("MM-DD-YYYY HH:mm:ss")}${LoggerColors.DarkGray + ">"} ${LoggerColors.DarkGray + "["}${this.color + this.name + LoggerColors + "]"}` +
      LoggerColors.Reset;

    console.log(format, ...colorized);
  }

  /**
   * Logs an info message to the console.
   *
   * @param arguments_ - The arguments to log.
   */
  public info(...arguments_: Array<unknown>): void {
    const colorized = this.colorize(...arguments_);
    const format =
      `${LoggerColors.DarkGray + "<"}${LoggerColors.Reset + moment().format("MM-DD-YYYY HH:mm:ss")}${LoggerColors.DarkGray + ">"} ${
        LoggerColors.DarkGray + "["
      }${this.color + this.name + LoggerColors.DarkGray + "]"} ${LoggerColors.DarkGray + "["}${LoggerColors.DarkAqua + "Info"}${LoggerColors.DarkGray + "]"}` +
      LoggerColors.Reset;

    console.log(format, ...colorized);
  }

  /**
   * Logs a warning message to the console.
   *
   * @param arguments_ - The arguments to log.
   */
  public warn(...arguments_: Array<unknown>): void {
    const colorized = this.colorize(...arguments_);
    const format =
      `${LoggerColors.DarkGray + "<"}${LoggerColors.Reset + moment().format("MM-DD-YYYY HH:mm:ss")}${LoggerColors.DarkGray + ">"} ${
        LoggerColors.DarkGray + "["
      }${this.color + this.name + LoggerColors.DarkGray + "]"} ${LoggerColors.DarkGray + "["}${LoggerColors.Yellow + "Warning"}${LoggerColors.DarkGray + "]"}` +
      LoggerColors.Reset;

    console.log(format, ...colorized);
  }

  /**
   * Logs an error message to the console.
   *
   * @param arguments_ - The arguments to log.
   */
  public error(...arguments_: Array<unknown>): void {
    const format =
      `${LoggerColors.DarkGray + "<"}${LoggerColors.Reset + moment().format("MM-DD-YYYY HH:mm:ss")}${LoggerColors.DarkGray + ">"} ${
        LoggerColors.DarkGray + "["
      }${this.color + this.name + LoggerColors.DarkGray + "]"} ${LoggerColors.DarkGray + "["}${LoggerColors.DarkRed + "Error"}${LoggerColors.DarkGray + "]"}` +
      LoggerColors.Reset;

    console.log(format, ...arguments_);
  }

  /**
   * Logs a success message to the console.
   *
   * @param arguments_ - The arguments to log.
   */
  public success(...arguments_: Array<unknown>): void {
    const colorized = this.colorize(...arguments_);
    const format =
      `${LoggerColors.DarkGray + "<"}${LoggerColors.Reset + moment().format("MM-DD-YYYY HH:mm:ss")}${LoggerColors.DarkGray + ">"} ${
        LoggerColors.DarkGray + "["
      }${this.color + this.name + LoggerColors.DarkGray + "]"} ${LoggerColors.DarkGray + "["}${LoggerColors.Green + "Success"}${
        LoggerColors.DarkGray + "]"
      }` + LoggerColors.Reset;

    console.log(format, ...colorized);
  }

  /**
   * Logs a debug message to the console.
   * This will only log if the `DEBUG` flag is set to `true`.
   *
   * @param arguments_ - The arguments to log.
   */
  public debug(...arguments_: Array<unknown>): void {
    const colorized = this.colorize(...arguments_);
    if (!Logger.DEBUG) return;

    const format =
      `${LoggerColors.DarkGray + "<"}${LoggerColors.Reset + moment().format("MM-DD-YYYY HH:mm:ss")}${LoggerColors.DarkGray + ">"} ${
        LoggerColors.DarkGray + "["
      }${this.color + this.name + LoggerColors.DarkGray + "]"} ${LoggerColors.DarkGray + "["}${LoggerColors.Red + "DEBUG"}${LoggerColors.DarkGray + "]"}` +
      LoggerColors.Reset;

    console.log(format, ...colorized);
  }

  /**
   * Logs a chat message to the console.
   * This shoud not be handeled by anyone just the TextPacket
   * @param arguments_ - The arguments to log.
   */
  public chat(...arguments_: Array<unknown>): void {
    const colorized = this.colorize(...arguments_);
    const format = `${LoggerColors.DarkGray + "<"}${LoggerColors.Reset + moment().format("MM-DD-YYYY HH:mm:ss")}${LoggerColors.DarkGray + ">"} ${
      LoggerColors.DarkGray + "["
    }${this.color + this.name + LoggerColors.DarkGray + "]"} ${LoggerColors.DarkGray + "["}${LoggerColors.DarkAqua + "Chat"}${
      LoggerColors.DarkGray + "]" + LoggerColors.Reset
    }`;

    console.log(format, colorized[0], ">", colorized[1]);
  }

  public colorize(...arguments_: Array<unknown>): Array<unknown> {
    const colorized = arguments_.map((argument) => {
      if (typeof argument === "string") {
        return formatMinecraftColorCode(argument as string);
      }
    });

    return colorized;
  }
}

export { Logger };
