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
import { CompoundTag, ListTag } from "@serenityjs/nbt";

import { NetworkHandler } from "../network";
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
        // Iterate through the requested packs
        for (const requested of packet.packs) {
          // Get the pack by its UUID
          const pack = this.serenity.resources.packs.get(requested.uuid);

          // This should never happen
          if (!pack) {
            // Disconnect the player
            player.disconnect(
              `Requested resource pack "${requested.uuid}" not found.`,
              DisconnectReason.ResourcePackLoadingFailed
            );

            // Break the loop
            break;
          }

          // Compress the pack into a buffer
          const buffer = pack.compress();

          // Create a new ResourcePackDataInfoPacket
          const information = new ResourcePackDataInfoPacket();

          // Get the max chunk size
          const maxChunkSize = this.serenity.resources.properties.chunkMaxSize;

          // Set the properties of the packet
          information.uuid = requested.uuid;
          information.chunkSize = maxChunkSize;
          information.chunkCount = pack.getChunkCount(maxChunkSize);
          information.fileSize = BigInt(buffer.byteLength);
          information.fileHash = pack.generateHash();
          information.isPremium = false;
          information.packType = PackType.Resources;

          // Send the ResourcePackDataInfoPacket to the player
          player.send(information);
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
        stack.hasEditorPacks = true;

        stack.texturePacks = [];
        for (const [uuid, pack] of this.serenity.resources.packs) {
          const packInfo = new ResourceIdVersions(
            pack.name,
            uuid,
            pack.version
          );

          stack.texturePacks.push(packInfo);
        }

        // Hardcoded Education Edition Resource Pack
        stack.texturePacks.push({
          name: "Education Edition Resource Pack",
          uuid: "0fba4063-dba1-4281-9b89-ff9390653530",
          version: "1.0.0"
        });

        // Send the ResourcePackStackPacket to the player
        return player.send(stack);
      }

      case ResourcePackResponse.Completed: {
        const packet = new StartGamePacket();
        packet.entityId = player.uniqueId;
        packet.runtimeEntityId = player.runtimeId;
        packet.playerGamemode = player.getGamemode();
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
        packet.ownerIdentifier = player.username;
        packet.levelId = "SerenityJS";
        packet.worldName = player.world.identifier;
        packet.premiumWorldTemplateId = player.world.identifier;
        packet.isTrial = false;
        packet.rewindHistorySize = 0;
        packet.serverAuthoritativeBlockBreaking = true;
        packet.currentTick = player.world.currentTick;
        packet.enchantmentSeed = player.world.properties.seed;

        // Map the custom blocks definitions to the packet
        packet.blockTypeDefinitions = world.blockPalette
          .getAllTypes()
          .map((type) => type.getNetworkDefinition());

        packet.multiplayerCorrelationId = "<raknet>a555-7ece-2f1c-8f69";
        packet.serverAuthoritativeInventory = true;
        packet.engine = "SerenityJS";
        packet.properties = EntityType.toPropertiesNbt(player.type);
        packet.blockPaletteChecksum = 0n;
        packet.worldTemplateId = "00000000-0000-0000-0000-000000000000";
        packet.clientSideGeneration = false;
        packet.blockNetworkIdsAreHashes = true;
        packet.tickDeathSystems = true; // This is a new property in 1.21.100
        packet.serverControlledSounds = true;

        // Get all the custom item properties
        const items = new ItemRegistryPacket();
        items.definitions = world.itemPalette.getAllTypes().map((item) => {
          const identifier = item.identifier;
          const networkId = item.network;
          const componentBased = item.getIsComponentBased();
          const itemVersion = item.getVersion();
          const properties = item.getIsComponentBased()
            ? item.properties
            : new CompoundTag();

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
        const list = actors.data.add(new ListTag<CompoundTag>([], "idlist"));

        const propertiesSync: Array<SyncActorPropertyPacket> = [];

        // Push all the entity types to the list
        for (const entry of world.entityPalette.getAllTypes()) {
          // Create a new compound tag for the entity
          const entity = EntityType.toNbt(entry);

          // Push the entity to the list
          list.push(entity);

          // Check if the entity has properties
          if (entry.getAllProperties().length > 0) {
            // Create a new SyncActorPropertyPacket
            const packet = new SyncActorPropertyPacket();
            packet.properties = EntityType.toPropertiesNbt(entry);

            // Push the packet to the properties sync array
            propertiesSync.push(packet);
          }
        }

        const status = new PlayStatusPacket();
        status.status = PlayStatus.PlayerSpawn;

        // Send the packets to the player
        player.sendImmediate(packet, status, actors, items, ...propertiesSync);
      }
    }
  }
}

export { ResourcePackClientResponseHandler };
