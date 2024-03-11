import type { Vector3f, Vector2f } from "@serenityjs/protocol";
import type {
	PlayerAttackMobsComponent,
	PlayerAttackPlayersComponent,
	PlayerBuildComponent,
	PlayerCountComponent,
	PlayerDoorsAndSwitchesComponent,
	PlayerExperienceComponent,
	PlayerFlySpeedComponent,
	PlayerFlyingComponent,
	PlayerHungerComponent,
	PlayerInstantBuildComponent,
	PlayerInvulnerableComponent,
	PlayerLevelComponent,
	PlayerLightningComponent,
	PlayerMayFlyComponent,
	PlayerMutedComponent,
	PlayerNoClipComponent,
	PlayerOpenContainersComponent,
	PlayerOperatorCommandsComponent,
	PlayerPrivilegedBuilderComponent,
	PlayerTeleportComponent,
	PlayerWalkSpeedComponent,
	PlayerWorldBuilderComponent,
	PlayerMineComponent
} from "../../player";
import type { EntityComponents } from "../entity";

interface PlayerProperties {
	dimension: string;
	position: Vector3f;
	rotation: Vector2f;
	username: string;
	uuid: string;
	xuid: string;
}

interface PlayerComponents extends EntityComponents {
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
	"minecraft:player.experience": PlayerExperienceComponent;
	"minecraft:player.hunger": PlayerHungerComponent;
	"minecraft:player.level": PlayerLevelComponent;
}

export type { PlayerProperties, PlayerComponents };
