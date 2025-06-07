import * as module from "@serenityjs/leveldb";

import type { PluginBuilder } from "bun";

function inject(builder: PluginBuilder) {
  builder.module(
    "@serenityjs/leveldb",
    () => {
      return {
        exports: module,
        loader: "object"
      }
    }
  );
}

export default inject;