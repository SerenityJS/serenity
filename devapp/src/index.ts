import {
  Serenity,
  InternalProvider,
  VoidGenerator,
  Dimension,
  Entity,
  EntityIdentifier
} from "@serenityjs/core";
import { Packet } from "@serenityjs/protocol";

const serenity = new Serenity({ port: 19142, debugLogging: true });

serenity.network.raknet.message = "2";

serenity.start();

serenity.registerProvider(InternalProvider);

const world = serenity.createWorld(InternalProvider, { identifier: "test123" });

if (world) {
  const dim = world.createDimension(VoidGenerator) as Dimension;

  const entity = new Entity(dim, EntityIdentifier.Cow);

  entity.components.set("test", { value: [1, 3, 4] });
}

// serenity.network.on("all", (data) => console.log(data.packet.getId()));

// serenity.network.on(Packet.PlayerAuthInput, (data) => {
//   console.log(data.packet);
// });
