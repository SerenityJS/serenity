import * as module from "@serenityjs/binarystream";

import type { PluginBuilder } from "bun";

function inject(builder: PluginBuilder) {
  builder.module(
    "@serenityjs/binarystream",
    () => {
      return {
        exports: module,
        loader: "object"
      }
    }
  );
}

export default inject;