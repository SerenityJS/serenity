import * as module from "@serenityjs/nethernet";

import type { PluginBuilder } from "bun";

function inject(builder: PluginBuilder) {
  builder.module("@serenityjs/nethernet", () => {
    return {
      exports: module,
      loader: "object",
    };
  });
}

export default inject;
