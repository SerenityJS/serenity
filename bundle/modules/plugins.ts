import * as module from "@serenityjs/plugins";

import type { PluginBuilder } from "bun";

function inject(builder: PluginBuilder) {
  builder.module(
    "@serenityjs/plugins",
    () => {
      return {
        exports: module,
        loader: "object"
      }
    }
  );
}

export default inject;