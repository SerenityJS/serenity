import { SerializedSkin } from "@serenityjs/protocol";

import { Device } from "../entity/device";
import { PlayerProperties } from "../types";

const DefaultPlayerProperties: PlayerProperties = {
  username: "SerenityJS",
  xuid: "0000000000000000",
  uuid: "00000000-0000-0000-0000-000000000000",
  uniqueId: -1n,
  device: Device.empty(),
  skin: SerializedSkin.empty()
};

export { DefaultPlayerProperties };
