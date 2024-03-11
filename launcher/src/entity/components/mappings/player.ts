import {
	PlayerBuildComponent,
	PlayerMineComponent,
	PlayerDoorsAndSwitchesComponent,
	PlayerOpenContainersComponent,
	PlayerAttackPlayersComponent,
	PlayerAttackMobsComponent,
	PlayerOperatorCommandsComponent,
	PlayerInvulnerableComponent,
	PlayerFlyingComponent,
	PlayerMayFlyComponent,
	PlayerInstantBuildComponent,
	PlayerLightningComponent,
	PlayerWalkSpeedComponent,
	PlayerFlySpeedComponent,
	PlayerTeleportComponent,
	PlayerMutedComponent,
	PlayerWorldBuilderComponent,
	PlayerNoClipComponent,
	PlayerPrivilegedBuilderComponent,
	PlayerCountComponent,
	PlayerHungerComponent,
	PlayerExperienceComponent,
	PlayerLevelComponent
} from "../../../player/components";
import { EntityCursorComponent } from "../cursor";

import { GENERIC_COMPONENTS } from "./generic";

import type { EntityComponent } from "../component";

const PLAYER_COMPONENTS: Array<typeof EntityComponent> = [
	...GENERIC_COMPONENTS,
	EntityCursorComponent,
	PlayerHungerComponent,
	PlayerLevelComponent,
	PlayerExperienceComponent,
	PlayerBuildComponent,
	PlayerMineComponent,
	PlayerDoorsAndSwitchesComponent,
	PlayerOpenContainersComponent,
	PlayerAttackPlayersComponent,
	PlayerAttackMobsComponent,
	PlayerOperatorCommandsComponent,
	PlayerTeleportComponent,
	PlayerInvulnerableComponent,
	PlayerFlyingComponent,
	PlayerMayFlyComponent,
	PlayerInstantBuildComponent,
	PlayerLightningComponent,
	PlayerFlySpeedComponent,
	PlayerWalkSpeedComponent,
	PlayerMutedComponent,
	PlayerWorldBuilderComponent,
	PlayerNoClipComponent,
	PlayerPrivilegedBuilderComponent,
	PlayerCountComponent
];

export { PLAYER_COMPONENTS };
