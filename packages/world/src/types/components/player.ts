import type {
	PlayerExperienceLevelComponent,
	PlayerChunkRenderingComponent,
	PlayerCursorComponent,
	PlayerExhaustionComponent,
	PlayerExperienceComponent,
	PlayerHungerComponent,
	PlayerSaturationComponent,
	PlayerCraftingInputComponent,
	PlayerAbilityComponent
} from "../../components";
import type { EntityComponents } from "./entity";
interface PlayerAttributeComponents {
	"minecraft:player.hunger": PlayerHungerComponent;
	"minecraft:player.saturation": PlayerSaturationComponent;
	"minecraft:player.exhaustion": PlayerExhaustionComponent;
	"minecraft:player.level": PlayerExperienceLevelComponent;
	"minecraft:player.experience": PlayerExperienceComponent;
}

interface PlayerComponents extends EntityComponents, PlayerAttributeComponents {
	"minecraft:cursor": PlayerCursorComponent;
	"minecraft:chunk_rendering": PlayerChunkRenderingComponent;
	"minecraft:crafting_input": PlayerCraftingInputComponent;
	"minecraft:ability": PlayerAbilityComponent;
}

export { PlayerComponents };
