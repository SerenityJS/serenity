import { SerializedSkin } from "@serenityjs/protocol";

import { ClientSystemInfo } from "../entity/system-info";
import { PlayerProperties } from "../types";

const DefaultPlayerProperties: PlayerProperties = {
  username: "SerenityJS",
  xuid: "0000000000000000",
  uuid: "00000000-0000-0000-0000-000000000000",
  clientSystemInfo: ClientSystemInfo.empty(),
  skin: SerializedSkin.empty()
};

export { DefaultPlayerProperties };
