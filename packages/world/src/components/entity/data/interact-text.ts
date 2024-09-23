import { ActorDataId, ActorDataType } from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { EntityDataComponent } from "./data";

import type { Entity } from "../../../entity";

class EntityInteractTextComponent extends EntityDataComponent {
	public static readonly identifier = "minecraft:interact_text";

	public static readonly types = [EntityIdentifier.Player];

	public readonly key = ActorDataId.InteractText;

	public readonly type = ActorDataType.String;

	public defaultValue = String();

	/**
	 * Creates a new entity nametag component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity nametag component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityInteractTextComponent.identifier);

		// Set the entity to have a nametag
		this.setCurrentValue(this.defaultValue, false);
	}

	/**
	 * Gets the current value of the entity nametag component.
	 * @returns The current value of the entity nametag component.
	 */
	public getCurrentValue(): string {
		return super.getCurrentValue() as string;
	}

	/**
	 * Sets the current value of the entity nametag component.
	 *
	 * @param value The new value of the entity nametag component.
	 * @param sync Whether to synchronize the entity nametag component.
	 */
	public setCurrentValue(value: string, sync?: boolean): void {
		super.setCurrentValue(value, sync);
	}
}

export { EntityInteractTextComponent };
