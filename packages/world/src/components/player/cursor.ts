import { ContainerId } from "@serenityjs/protocol";

import { EntityContainer } from "../../container";
import { Player } from "../../player";

import { PlayerComponent } from "./player-component";

class PlayerCursorComponent extends PlayerComponent {
	public readonly identifier = "minecraft:cursor";

	public readonly container: EntityContainer;

	public readonly containerId: ContainerId;

	public readonly inventorySize: number;

	public selectedSlot: number = 0;

	public constructor(player: Player) {
		super(player);
		this.containerId = ContainerId.Ui;
		this.inventorySize = 1;
		this.container = new EntityContainer(
			player,
			this.containerId,
			this.inventorySize
		);
	}
}

export { PlayerCursorComponent };
