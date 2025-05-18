import {
  AvailableActorIdentifiersPacket,
  DisconnectReason,
  GameRuleType,
  ItemData,
  MINECRAFT_VERSION,
  Packet,
  PlayStatus,
  PlayStatusPacket,
  ResourceIdVersions,
  ResourcePackClientResponsePacket,
  ResourcePackDataInfoPacket,
  ResourcePackResponse,
  ResourcePackStackPacket,
  StartGamePacket,
  ItemRegistryPacket,
  PermissionLevel,
  SyncActorPropertyPacket,
  PackType
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";
import { CompoundTag, TagType } from "@serenityjs/nbt";

import { NetworkHandler } from "../network";
import { Resources } from "../resources";
import { EntityType } from "../entity";

class ResourcePackClientResponseHandler extends NetworkHandler {
  public static readonly packet = Packet.ResourcePackClientResponse;

  public handle(
    packet: ResourcePackClientResponsePacket,
    connection: Connection
  ): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Get the players current world
    const world = player.dimension.world;

    // this.serenity.resources.logger.debug(
    //   `Player '${player.username}' responded to resource packs with response '${ResourcePackResponse[packet.response]}' (${packet.response})`
    // );

    switch (packet.response) {
      default: {
        // Debug the unhandled ResourcePackClientResponse
        this.serenity.logger.debug(
          `Unhandled ResourcePackClientResponse: ${ResourcePackResponse[packet.response]}`
        );
        break;
      }

      case ResourcePackResponse.Refused: {
        // This means the resource packs must be accepted but the client didn't accept them
        player.disconnect(
          "Must accept resource packs.",
          DisconnectReason.Kicked
        );

        // this.serenity.resources.logger.info(
        //   `Kicked player '${player.username}' for refusing required resource packs.`
        // );

        return;
      }

      case ResourcePackResponse.SendPacks: {
        // this.serenity.resourcePacks.logger.info(
        //   `Player '${player.username}' requested ${packet.packs.length} resource packs.`
        // );

        for (const packId of packet.packs) {
          // Split the packId into uuid and version
          const [uuid, _version] = packId.split("_") as [string, string];

          const pack = this.serenity.resources.packs.get(uuid);

          // This should never happen
          if (!pack) {
            // this.serenity.resourcePacks.logger.error(
            //   `Player '${player.username}' requested pack '${packId}' which cannot be found.`
            // );
            // Not sure if this blocks the login process, may need to kick the player if so.
            // More testing needed, especially if we plan to implement dynamically changing the pack stack while the server is running.
            continue;
          }

          // Compress the pack into a buffer
          const buffer = pack.compress();

          const dataInfoPacket = new ResourcePackDataInfoPacket();

          dataInfoPacket.packId = packId;
          dataInfoPacket.maxChunkSize = Resources.MAX_CHUNK_SIZE;
          dataInfoPacket.chunkCount = pack.getChunkCount();
          dataInfoPacket.fileSize = BigInt(buffer.byteLength);
          dataInfoPacket.fileHash = pack.generateHash();
          dataInfoPacket.isPremium = false;
          dataInfoPacket.packType = PackType.Resources;

          player.send(dataInfoPacket);
        }

        return;
      }

      case ResourcePackResponse.HaveAllPacks: {
        // Create a new ResourcePackStackPacket
        const stack = new ResourcePackStackPacket();
        stack.mustAccept = false; // this.serenity.resourcePacks.mustAcceptResourcePacks;
        stack.behaviorPacks = [];
        stack.gameVersion = MINECRAFT_VERSION;
        stack.experiments = [];
        stack.experimentsPreviouslyToggled = false;
        stack.hasEditorPacks = false;

        stack.texturePacks = [];
        for (const [uuid, pack] of this.serenity.resources.packs) {
          const packInfo = new ResourceIdVersions(
            pack.name,
            uuid,
            pack.version
          );

          stack.texturePacks.push(packInfo);
        }

        // Send the ResourcePackStackPacket to the player
        return player.send(stack);
      }

      case ResourcePackResponse.Completed: {
        const packet = new StartGamePacket();
        packet.entityId = player.uniqueId;
        packet.runtimeEntityId = player.runtimeId;
        packet.playerGamemode = player.gamemode;
        packet.playerPosition = player.position.add({ x: 0, y: 1.75, z: 0 });
        packet.pitch = player.rotation.pitch;
        packet.yaw = player.rotation.yaw;
        packet.seed = BigInt(player.dimension.generator.properties.seed);
        packet.biomeType = 0;
        packet.biomeName = "plains";
        packet.dimension = player.dimension.type;
        packet.generator = 1;
        packet.worldGamemode = player.world.getDefaultGamemode();
        packet.hardcore = false;
        packet.difficulty = player.world.getDifficulty();
        packet.spawnPosition = player.dimension.spawnPosition;
        packet.achievementsDisabled = true;
        packet.editorWorldType = 0;
        packet.createdInEdior = false;
        packet.exportedFromEdior = false;
        packet.dayCycleStopTime = player.world.dayTime;
        packet.eduOffer = 0;
        packet.eduFeatures = true;
        packet.eduProductUuid = "";
        packet.rainLevel = 0;
        packet.lightningLevel = 0;
        packet.confirmedPlatformLockedContent = false;
        packet.multiplayerGame = true;
        packet.broadcastToLan = true;
        packet.xblBroadcastMode = 6;
        packet.platformBroadcastMode = 6;
        packet.commandsEnabled = true;
        packet.texturePacksRequired = false;

        // Assign the gamerules to the packet
        packet.gamerules = packet.gamerules = Object.entries(
          world.gamerules
        ).map(([name, value]) => {
          // Get the type of the value
          const type =
            typeof value === "boolean" ? GameRuleType.Bool : GameRuleType.Int;

          // Create the gamerule object
          return { name, type, value, editable: true };
        });

        packet.experiments = [];
        packet.experimentsPreviouslyToggled = false;
        packet.bonusChest = false;
        packet.mapEnabled = false;
        packet.permissionLevel = player.isOp
          ? PermissionLevel.Operator
          : PermissionLevel.Member;

        packet.serverChunkTickRange = player.dimension.simulationDistance >> 4;
        packet.hasLockedBehaviorPack = false;
        packet.hasLockedResourcePack = false;
        packet.isFromLockedWorldTemplate = false;
        packet.useMsaGamertagsOnly = false;
        packet.isFromWorldTemplate = false;
        packet.isWorldTemplateOptionLocked = false;
        packet.onlySpawnV1Villagers = false;
        packet.personaDisabled = false;
        packet.customSkinsDisabled = false;
        packet.emoteChatMuted = false;
        packet.gameVersion = MINECRAFT_VERSION;
        packet.limitedWorldWidth = 16;
        packet.limitedWorldLength = 16;
        packet.isNewNether = false;
        packet.eduResourceUriButtonName = "";
        packet.eduResourceUriLink = "";
        packet.experimentalGameplayOverride = false;
        packet.chatRestrictionLevel = 0;
        packet.disablePlayerInteractions = false;
        packet.serverIdentfier = "SerenityJS";
        packet.worldIdentifier = player.world.identifier;
        packet.scenarioIdentifier = "SerenityJS";
        packet.levelId = "SerenityJS";
        packet.worldName = player.world.identifier;
        packet.premiumWorldTemplateId = "00000000-0000-0000-0000-000000000000";
        packet.isTrial = false;
        packet.movementAuthority = 2;
        packet.rewindHistorySize = 0;
        packet.serverAuthoritativeBlockBreaking = true;
        packet.currentTick = player.world.currentTick;
        packet.enchantmentSeed = player.world.properties.seed;

        // Map the custom blocks definitions to the packet
        packet.blockTypeDefinitions = [];
        packet.blockTypeDefinitions = world.blockPalette
          .getAllTypes()
          .map((type) => type.getNetworkDefinition());

        packet.multiplayerCorrelationId = "<raknet>a555-7ece-2f1c-8f69";
        packet.serverAuthoritativeInventory = true;
        packet.engine = "SerenityJS";
        packet.propertyData1 = 0x0a;
        packet.propertyData2 = 0x00;
        packet.propertyData3 = 0x00;
        packet.blockPaletteChecksum = 0n;
        packet.worldTemplateId = "00000000000000000000000000000000";
        packet.clientSideGeneration = false;
        packet.blockNetworkIdsAreHashes = true;
        packet.serverControlledSounds = true;

        // Get all the custom item properties
        const items = new ItemRegistryPacket();
        items.definitions = world.itemPalette.getAllTypes().map((item) => {
          const identifier = item.identifier;
          const networkId = item.network;
          const componentBased = item.isComponentBased;
          const itemVersion = item.version;
          const properties = !item.isComponentBased
            ? new CompoundTag()
            : item.properties;

          return new ItemData(
            identifier,
            networkId,
            componentBased,
            itemVersion,
            properties
          );
        });

        // Get the available actor identifiers
        const actors = new AvailableActorIdentifiersPacket();
        actors.data = new CompoundTag();

        // Create a new list tag for the entities
        const list = actors.data.createListTag<CompoundTag<unknown>>({
          name: "idlist",
          value: [],
          listType: TagType.Compound
        });

        const propertiesSync: Array<SyncActorPropertyPacket> = [];

        // Push all the entity types to the list
        for (const entry of world.entityPalette.getAllTypes()) {
          // Create a new compound tag for the entity
          const entity = EntityType.toNbt(entry);

          // Push the entity to the list
          list.value.push(entity);

          // Check if the entity has properties
          if (entry.properties.size > 0) {
            // Create a new SyncActorPropertyPacket
            const packet = new SyncActorPropertyPacket();
            packet.properties = EntityType.toPropertiesNbt(entry);

            // Push the packet to the properties sync array
            propertiesSync.push(packet);
          }
        }

        const status = new PlayStatusPacket();
        status.status = PlayStatus.PlayerSpawn;

        player.sendImmediate(packet, status, actors, items, ...propertiesSync);
      }
    }
  }
}

export { ResourcePackClientResponseHandler };
