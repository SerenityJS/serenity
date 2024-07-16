import type {
	PlayerExperienceLevelComponent,
	PlayerAttackMobsComponent,
	PlayerAttackPlayersComponent,
	PlayerBuildComponent,
	PlayerChunkRenderingComponent,
	PlayerCountComponent,
	PlayerCursorComponent,
	PlayerDoorsAndSwitchesComponent,
	PlayerExhaustionComponent,
	PlayerExperienceComponent,
	PlayerFlySpeedComponent,
	PlayerFlyingComponent,
	PlayerHungerComponent,
	PlayerInstantBuildComponent,
	PlayerInvulnerableComponent,
	PlayerLightningComponent,
	PlayerMayFlyComponent,
	PlayerMineComponent,
	PlayerMutedComponent,
	PlayerNoClipComponent,
	PlayerOpenContainersComponent,
	PlayerOperatorCommandsComponent,
	PlayerPrivilegedBuilderComponent,
	PlayerSaturationComponent,
	PlayerTeleportComponent,
	PlayerWalkSpeedComponent,
	PlayerWorldBuilderComponent
} from "../../components";
import type { EntityComponents } from "./entity";

interface PlayerAbilityComponents {
	"minecraft:ability.attack_mobs": PlayerAttackMobsComponent;
	"minecraft:ability.attack_players": PlayerAttackPlayersComponent;
	"minecraft:ability.build": PlayerBuildComponent;
	"minecraft:ability.count": PlayerCountComponent;
	"minecraft:ability.doors_and_switches": PlayerDoorsAndSwitchesComponent;
	"minecraft:ability.fly_speed": PlayerFlySpeedComponent;
	"minecraft:ability.flying": PlayerFlyingComponent;
	"minecraft:ability.instant_build": PlayerInstantBuildComponent;
	"minecraft:ability.invulnerable": PlayerInvulnerableComponent;
	"minecraft:ability.lightning": PlayerLightningComponent;
	"minecraft:ability.may_fly": PlayerMayFlyComponent;
	"minecraft:ability.mine": PlayerMineComponent;
	"minecraft:ability.muted": PlayerMutedComponent;
	"minecraft:ability.no_clip": PlayerNoClipComponent;
	"minecraft:ability.open_containers": PlayerOpenContainersComponent;
	"minecraft:ability.operator_commands": PlayerOperatorCommandsComponent;
	"minecraft:ability.privileged_builder": PlayerPrivilegedBuilderComponent;
	"minecraft:ability.teleport": PlayerTeleportComponent;
	"minecraft:ability.walk_speed": PlayerWalkSpeedComponent;
	"minecraft:ability.world_builder": PlayerWorldBuilderComponent;
}
interface PlayerAttributeComponents {
	"minecraft:player.hunger": PlayerHungerComponent;
	"minecraft:player.saturation": PlayerSaturationComponent;
	"minecraft:player.exhaustion": PlayerExhaustionComponent;
	"minecraft:player.level": PlayerExperienceLevelComponent;
	"minecraft:player.experience": PlayerExperienceComponent;
}

interface PlayerComponents
	extends EntityComponents,
		PlayerAbilityComponents,
		PlayerAttributeComponents {
	"minecraft:cursor": PlayerCursorComponent;
	"minecraft:chunk_rendering": PlayerChunkRenderingComponent;
}

export { PlayerComponents, PlayerAbilityComponents };
