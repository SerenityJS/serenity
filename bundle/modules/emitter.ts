import * as module from "@serenityjs/emitter";

import type { PluginBuilder } from "bun";

function inject(builder: PluginBuilder) {
  builder.module(
    "@serenityjs/emitter",
    () => {
      return {
        exports: module,
        loader: "object"
      }
    }
  );
}

export default inject;