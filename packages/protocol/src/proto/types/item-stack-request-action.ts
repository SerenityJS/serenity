import { DataType } from "@serenityjs/raknet";

import { ItemStackRequestActionType } from "../../enums";

import { ItemStackActionTakePlace } from "./item-stack-request-action-take-place";
import { ItemStackRequestActionSwap } from "./item-stack-request-action-swap";
import { ItemStackRequestActionDrop } from "./item-stack-request-action-drop";
import { ItemStackRequestActionDestroyConsume } from "./item-stack-request-action-destroy-consume";
import { ItemStackRequestActionCreate } from "./item-stack-request-action-create";
import { ItemStackRequestActionBeanconPayment } from "./item-stack-request-action-beacon-payment";
import { ItemStackRequestActionMineBlock } from "./item-stack-request-action-mine-block";
import { ItemStackRequestActionCraftRecipe } from "./item-stack-request-action-craft-recipe";
import { ItemStackRequestActionCraftRecipeAuto } from "./item-stack-request-action-craft-recipe-auto";
import { ItemStackRequestActionCraftCreative } from "./item-stack-request-action-craft-creative";
import { ItemStackRequestActionOptional } from "./item-stack-request-action-optional";
import { ItemStackRequestActionResultsDeprecated } from "./item-stack-request-action-results-deprecated";

import type { BinaryStream } from "@serenityjs/binarystream";
import type { ItemStackRequestActionCraftLoomRequest } from "./item-stack-request-action-craft-loom-request";
import type { ItemStackRequestActionCraftGrindstoneRequest } from "./item-stack-request-action-craft-grindstone-request";

class ItemStackRequestAction extends DataType {
	/**
	 * The action of the item stack request action.
	 */
	public readonly action: ItemStackRequestActionType;

	/**
	 * The take or place of the item stack request action.
	 */
	public readonly takeOrPlace: ItemStackActionTakePlace | null;

	/**
	 * The swap of the item stack request action.
	 */
	public readonly swap: ItemStackRequestActionSwap | null;

	/**
	 * The drop of the item stack request action.
	 */
	public readonly drop: ItemStackRequestActionDrop | null;

	/**
	 * The destroy or consume of the item stack request action.
	 */
	public readonly destroyOrConsume: ItemStackRequestActionDestroyConsume | null;

	/**
	 * The create of the item stack request action.
	 */
	public readonly create: ItemStackRequestActionCreate | null;

	/**
	 * The beacon payment of the item stack request action.
	 */
	public readonly beaconPayment: ItemStackRequestActionBeanconPayment | null;

	/**
	 * The mine block of the item stack request action.
	 */
	public readonly mineBlock: ItemStackRequestActionMineBlock | null;

	/**
	 * The craft recipe of the item stack request action.
	 */
	public readonly craftRecipe: ItemStackRequestActionCraftRecipe | null;

	/**
	 * The craft recipe auto of the item stack request action.
	 */
	public readonly craftRecipeAuto: ItemStackRequestActionCraftRecipeAuto | null;

	/**
	 * The craft creative of the item stack request action.
	 */
	public readonly craftCreative: ItemStackRequestActionCraftCreative | null;

	/**
	 * The optional of the item stack request action.
	 */
	public readonly optional: ItemStackRequestActionOptional | null;

	/**
	 * The craft grindstone request of the item stack request action.
	 */
	public readonly craftGrindstoneRequest: ItemStackRequestActionCraftGrindstoneRequest | null;

	/**
	 * The craft loom request of the item stack request action.
	 */
	public readonly craftLoomRequest: ItemStackRequestActionCraftLoomRequest | null;

	/**
	 * The results deprecated of the item stack request action.
	 */
	public readonly resultsDeprecated: ItemStackRequestActionResultsDeprecated | null;

	/**
	 * Creates a new instance of ItemStackRequestAction.
	 * @param action - The action of the item stack request action.
	 * @param takeOrPlace - The take or place of the item stack request action.
	 * @param swap - The swap of the item stack request action.
	 * @param drop - The drop of the item stack request action.
	 * @param destroyOrConsume - The destroy or consume of the item stack request action.
	 * @param create - The create of the item stack request action.
	 * @param beaconPayment - The beacon payment of the item stack request action.
	 * @param mineBlock - The mine block of the item stack request action.
	 * @param craftRecipe - The craft recipe of the item stack request action.
	 * @param craftRecipeAuto - The craft recipe auto of the item stack request action.
	 * @param craftCreative - The craft creative of the item stack request action.
	 * @param optional - The optional of the item stack request action.
	 * @param craftGrindstoneRequest - The craft grindstone request of the item stack request action.
	 * @param craftLoomRequest - The craft loom request of the item stack request action.
	 * @param resultsDeprecated - The results deprecated of the item stack request action.
	 */
	public constructor(
		action: ItemStackRequestActionType,
		takeOrPlace?: ItemStackActionTakePlace | null,
		swap?: ItemStackRequestActionSwap | null,
		drop?: ItemStackRequestActionDrop | null,
		destroyOrConsume?: ItemStackRequestActionDestroyConsume | null,
		create?: ItemStackRequestActionCreate | null,
		beaconPayment?: ItemStackRequestActionBeanconPayment | null,
		mineBlock?: ItemStackRequestActionMineBlock | null,
		craftRecipe?: ItemStackRequestActionCraftRecipe | null,
		craftRecipeAuto?: ItemStackRequestActionCraftRecipeAuto | null,
		craftCreative?: ItemStackRequestActionCraftCreative | null,
		optional?: ItemStackRequestActionOptional | null,
		craftGrindstoneRequest?: ItemStackRequestActionCraftGrindstoneRequest | null,
		craftLoomRequest?: ItemStackRequestActionCraftLoomRequest | null,
		resultsDeprecated?: ItemStackRequestActionResultsDeprecated | null
	) {
		super();
		this.action = action;
		this.takeOrPlace = takeOrPlace ?? null;
		this.swap = swap ?? null;
		this.drop = drop ?? null;
		this.destroyOrConsume = destroyOrConsume ?? null;
		this.create = create ?? null;
		this.beaconPayment = beaconPayment ?? null;
		this.mineBlock = mineBlock ?? null;
		this.craftRecipe = craftRecipe ?? null;
		this.craftRecipeAuto = craftRecipeAuto ?? null;
		this.craftCreative = craftCreative ?? null;
		this.optional = optional ?? null;
		this.craftGrindstoneRequest = craftGrindstoneRequest ?? null;
		this.craftLoomRequest = craftLoomRequest ?? null;
		this.resultsDeprecated = resultsDeprecated ?? null;
	}

	public static read(stream: BinaryStream): ItemStackRequestAction {
		// Read the action.
		const action = stream.readUint8();

		switch (action) {
			default: {
				return new this(action);
			}

			case ItemStackRequestActionType.Take:
			case ItemStackRequestActionType.Place:
			case ItemStackRequestActionType.TakeFromItemContainer_DEPRECATED:
			case ItemStackRequestActionType.PlaceInItemContainer_DEPRECATED: {
				return new this(action, ItemStackActionTakePlace.read(stream));
			}

			case ItemStackRequestActionType.Swap: {
				return new this(action, null, ItemStackRequestActionSwap.read(stream));
			}

			case ItemStackRequestActionType.Drop: {
				return new this(
					action,
					null,
					null,
					ItemStackRequestActionDrop.read(stream)
				);
			}

			case ItemStackRequestActionType.Destroy:
			case ItemStackRequestActionType.Consume: {
				return new this(
					action,
					null,
					null,
					null,
					ItemStackRequestActionDestroyConsume.read(stream)
				);
			}

			case ItemStackRequestActionType.Create: {
				return new this(
					action,
					null,
					null,
					null,
					null,
					ItemStackRequestActionCreate.read(stream)
				);
			}

			case ItemStackRequestActionType.ScreenBeaconPayment: {
				return new this(
					action,
					null,
					null,
					null,
					null,
					null,
					ItemStackRequestActionBeanconPayment.read(stream)
				);
			}

			case ItemStackRequestActionType.ScreenHUDMineBlock: {
				return new this(
					action,
					null,
					null,
					null,
					null,
					null,
					null,
					ItemStackRequestActionMineBlock.read(stream)
				);
			}

			case ItemStackRequestActionType.CraftRecipe: {
				return new this(
					action,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					ItemStackRequestActionCraftRecipe.read(stream)
				);
			}

			case ItemStackRequestActionType.CraftRecipeAuto: {
				return new this(
					action,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					ItemStackRequestActionCraftRecipeAuto.read(stream)
				);
			}

			case ItemStackRequestActionType.CraftCreative: {
				return new this(
					action,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					ItemStackRequestActionCraftCreative.read(stream)
				);
			}

			case ItemStackRequestActionType.CraftRecipeOptional: {
				return new this(
					action,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					ItemStackRequestActionOptional.read(stream)
				);
			}

			case ItemStackRequestActionType.CraftResults_DEPRECATEDASKTYLAING: {
				return new this(
					action,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					ItemStackRequestActionResultsDeprecated.read(stream)
				);
			}
		}
	}
}

export { ItemStackRequestAction };
