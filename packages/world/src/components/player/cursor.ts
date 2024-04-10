import { ContainerId } from "@serenityjs/protocol";

import { EntityContainer } from "../../container";

import { PlayerComponent } from "./player-component";

import type { Player } from "../../player";

class PlayerCursorComponent extends PlayerComponent {
	public readonly container: EntityContainer;

	public readonly containerId: ContainerId;

	public readonly inventorySize: number;

	public constructor(player: Player) {
		super(player, "minecraft:cursor");
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
