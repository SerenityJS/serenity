import { Serenity, InternalProvider, VoidGenerator } from "@serenityjs/core";

const serenity = new Serenity({ port: 19142, debugLogging: true });

serenity.network.raknet.message = "2";

serenity.start();

serenity.registerProvider(InternalProvider);

const world = serenity.createWorld(InternalProvider, { identifier: "test123" });

if (world) {
  const dim1 = world.createDimension(VoidGenerator, {
    identifier: "void_test"
  });
}

serenity.network.on("all", (data) => console.log(data.packet.getId()));
