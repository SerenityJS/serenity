import * as module from "../../../packages/emitter";

import type { PluginBuilder } from "bun";

function inject(builder: PluginBuilder) {
  builder.module("@serenityjs/emitter", () => {
    return {
      exports: module,
      loader: "object",
    };
  });
}

export default inject;
