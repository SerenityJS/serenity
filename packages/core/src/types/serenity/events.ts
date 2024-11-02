import { ServerEvent } from "../../enums";

interface ServerEvents {
  [ServerEvent.Start]: [unknown];
  [ServerEvent.Stop]: [unknown];
}

export { ServerEvents };
