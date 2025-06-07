import * as module from "../../../packages/raknet";

import type { PluginBuilder } from "bun";

function inject(builder: PluginBuilder) {
  builder.module("@serenityjs/raknet", () => {
    return {
      exports: module,
      loader: "object",
    };
  });
}

export default inject;
