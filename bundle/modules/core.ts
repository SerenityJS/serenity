import * as module from "@serenityjs/core";

import type { PluginBuilder } from "bun";

function inject(builder: PluginBuilder) {
  builder.module(
    "@serenityjs/core",
    () => {
      return {
        exports: module,
        loader: "object"
      }
    }
  );
}

export default inject;