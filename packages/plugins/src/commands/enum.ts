import { CustomEnum } from "@serenityjs/core";

class PluginsEnum extends CustomEnum {
  public static readonly identifier = "plugins";
  public static readonly options: Array<string> = [];
}

class PluginActionsEnum extends CustomEnum {
  public static readonly identifier = "plugin_actions";
  public static readonly options: Array<string> = ["list", "reload"];
}

export { PluginsEnum, PluginActionsEnum };
