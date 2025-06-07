import * as module from "../../../packages/protocol";

import type { PluginBuilder } from "bun";

function inject(builder: PluginBuilder) {
  builder.module("@serenityjs/protocol", () => {
    return {
      exports: module,
      loader: "object",
    };
  });
}

export default inject;
