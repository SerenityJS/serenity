import * as module from "@serenityjs/data";

import type { PluginBuilder } from "bun";

function inject(builder: PluginBuilder) {
  builder.module(
    "@serenityjs/data",
    () => {
      return {
        exports: module,
        loader: "object"
      }
    }
  );
}

export default inject;