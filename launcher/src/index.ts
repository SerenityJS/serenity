export * from "./serenity";
export * from "./handlers";
export * from "./properties";
export * from "./events";

import { Player, Superflat } from "@serenityjs/world";
import { DimensionType } from "@serenityjs/protocol";
import { StringEnum } from "@serenityjs/command";

import { Serenity } from "./serenity";

const serenity = new Serenity();

serenity.start();

// const world = serenity.worlds.get();

// world.createDimension(
// 	"minecraft:nether",
// 	DimensionType.Nether,
// 	new Superflat()
// );

// for (const world of serenity.worlds.getAll()) {
// 	world.commands.register(
// 		"dimension",
// 		"Changes dimension",
// 		(origin, parameters) => {
// 			if (origin instanceof Player) {
// 				const world = serenity.worlds.get(parameters.world.result);

// 				if (!world) {
// 					return {
// 						message: "World not found."
// 					};
// 				}

// 				const dimension = world.getDimension(parameters.dim.result);

// 				if (!dimension) {
// 					return {
// 						message: "Dimension not found."
// 					};
// 				}

// 				origin.teleport(origin.position, dimension);
// 			}

// 			return {};
// 		},
// 		{
// 			world: StringEnum,
// 			dim: StringEnum
// 		}
// 	);

// 	world.commands.register("tps", "Gets the server TPS", () => {
// 		return {
// 			message: `Server TPS: ${serenity.tps}`
// 		};
// 	});
// }
