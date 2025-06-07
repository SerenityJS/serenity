import * as module from "@serenityjs/logger";

import type { PluginBuilder } from "bun";

function inject(builder: PluginBuilder) {
  builder.module(
    "@serenityjs/logger",
    () => {
      return {
        exports: module,
        loader: "object"
      }
    }
  );
}

export default inject;