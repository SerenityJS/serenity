import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerNoClipComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.NoClip;

	public readonly flag = AbilityLayerFlag.NoClip;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerNoClipComponent };
