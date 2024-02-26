import type { Vector3f, Vector2f } from '@serenityjs/bedrock-protocol';
import type { PlayerMineComponent } from '../../player/components/ability/Mine.js';
import type {
	PlayerAttackMobsComponent,
	PlayerAttackPlayersComponent,
	PlayerBuildComponent,
	PlayerCountComponent,
	PlayerDoorsAndSwitchesComponent,
	PlayerFlySpeedComponent,
	PlayerFlyingComponent,
	PlayerHungerComponent,
	PlayerInstantBuildComponent,
	PlayerInvulnerableComponent,
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
} from '../../player/index.js';
import type { EntityComponents } from '../entity/Components.js';

interface PlayerProperties {
	dimension: string;
	position: Vector3f;
	rotation: Vector2f;
	username: string;
	uuid: string;
	xuid: string;
}

interface PlayerComponents extends EntityComponents {
	'minecraft:ability.attack_mobs': PlayerAttackMobsComponent;
	'minecraft:ability.attack_players': PlayerAttackPlayersComponent;
	'minecraft:ability.build': PlayerBuildComponent;
	'minecraft:ability.count': PlayerCountComponent;
	'minecraft:ability.doors_and_switches': PlayerDoorsAndSwitchesComponent;
	'minecraft:ability.fly_speed': PlayerFlySpeedComponent;
	'minecraft:ability.flying': PlayerFlyingComponent;
	'minecraft:ability.instant_build': PlayerInstantBuildComponent;
	'minecraft:ability.invulnerable': PlayerInvulnerableComponent;
	'minecraft:ability.lightning': PlayerLightningComponent;
	'minecraft:ability.may_fly': PlayerMayFlyComponent;
	'minecraft:ability.mine': PlayerMineComponent;
	'minecraft:ability.muted': PlayerMutedComponent;
	'minecraft:ability.no_clip': PlayerNoClipComponent;
	'minecraft:ability.open_containers': PlayerOpenContainersComponent;
	'minecraft:ability.operator_commands': PlayerOperatorCommandsComponent;
	'minecraft:ability.privileged_builder': PlayerPrivilegedBuilderComponent;
	'minecraft:ability.teleport': PlayerTeleportComponent;
	'minecraft:ability.walk_speed': PlayerWalkSpeedComponent;
	'minecraft:ability.world_builder': PlayerWorldBuilderComponent;
	'minecraft:player.hunger': PlayerHungerComponent;
}

export type { PlayerProperties, PlayerComponents };
