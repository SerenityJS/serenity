import { PluginAfterEvents } from "./after-events";
import { PluginBeforeEvents } from "./before-events";
import { PluginOnEvents } from "./on-events";

type PluginEvents = Partial<PluginOnEvents> &
  Partial<PluginBeforeEvents> &
  Partial<PluginAfterEvents>;

export { PluginEvents };
