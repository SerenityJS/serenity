import { ContainerId, ContainerType } from "@serenityjs/protocol";

import { EntityContainer } from "../../container";

import { PlayerComponent } from "./player-component";

import type { Player } from "../../player";

class PlayerCraftingInputComponent extends PlayerComponent {
	public static readonly identifier = "minecraft:crafting_input";

	public readonly container: EntityContainer;

	public readonly containerType: ContainerType = ContainerType.Workbench;

	public readonly containerId: ContainerId = ContainerId.Ui;

	public readonly inventorySize: number = 4;

	public constructor(player: Player) {
		super(player, PlayerCraftingInputComponent.identifier);
		this.container = new EntityContainer(
			player,
			this.containerType,
			this.containerId,
			this.inventorySize
		);
	}
}

export { PlayerCraftingInputComponent };
