import { ContainerId, ContainerType } from "@serenityjs/protocol";

import { BlockIdentifier } from "../../enums";
import { Block } from "../block";
import { BlockContainer } from "../..";

import { BlockInventoryTrait } from "./inventory";

class BlockFurnaceTrait extends BlockInventoryTrait {
  public static readonly identifier = "furnace";
  public static readonly types = [BlockIdentifier.Furnace];

  public constructor(block: Block) {
    super(block);

    // Create the container for the trait
    this.container = new BlockContainer(
      block,
      ContainerType.Furnace,
      ContainerId.None,
      3
    );
  }

  public onOpen(): void {
    // TODO: Implement the furnace opening logic
  }

  public onClose(): void {
    // TODO: Implement the furnace closing logic
  }
}

export { BlockFurnaceTrait };
