import { ContainerId, ContainerType } from "@serenityjs/protocol";

import { BlockIdentifier } from "../../enums";
import { Block } from "../block";

import { BlockInventoryTrait } from "./inventory";

class BlockFurnaceTrait extends BlockInventoryTrait {
  public static readonly identifier = "furnace";
  public static readonly types = [BlockIdentifier.Furnace];

  public constructor(block: Block) {
    super(block);

    // Assign the container properties for the furnace
    this.containerType = ContainerType.Furnace;
    this.containerId = ContainerId.None;
    this.containerSize = 3;
  }

  public onOpen(): void {
    // TODO: Implement the furnace opening logic
  }

  public onClose(): void {
    // TODO: Implement the furnace closing logic
  }
}

export { BlockFurnaceTrait };
