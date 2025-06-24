import { PositionEnum, StringEnum, StructureOperation } from "../enums";
import { Dimension, type World } from "../../world";

const register = (world: World) => {
  // Register the setblock command
  world.commandPalette.register(
    "structure",
    "Load a structure into the world.",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      // Create an overload for the command
      registry.overload(
        {
          operation: StructureOperation,
          identifier: StringEnum,
          position: PositionEnum
        },
        async (context) => {
          // Get the operation from the context
          const operation = context.operation.result!;

          // Get the dimension from the context
          const dimension =
            context.origin instanceof Dimension
              ? context.origin
              : context.origin.dimension;

          switch (operation) {
            case "load": {
              // Get the identifier and position from the context
              const identifier = context.identifier.result!;

              // Check if the identifier is valid
              if (!identifier || !dimension.world.structures.has(identifier))
                // Throw an error if the identifier is invalid
                throw new TypeError(
                  `Structure with identifier "${identifier}" does not exist.`
                );

              // Get the structure from the dimension
              const structure = dimension.world.structures.get(identifier)!;

              // Get the position from the context
              const position = context.position.result!.floor();

              // Load the structure into the dimension
              await dimension.placeStructureAsync(structure, position);

              // Send a success message
              return {
                message: `§7Successfully loaded structure §u${identifier}§7 at §8${position.x}, ${position.y}, ${position.z}§7.§r`
              };
            }
          }
        }
      );
    },
    () => {}
  );
};

export default register;
