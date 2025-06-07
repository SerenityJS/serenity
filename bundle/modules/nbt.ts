import * as module from "@serenityjs/nbt";

import type { PluginBuilder } from "bun";

function inject(builder: PluginBuilder) {
  builder.module(
    "@serenityjs/nbt",
    () => {
      return {
        exports: module,
        loader: "object"
      }
    }
  );
}

export default inject;