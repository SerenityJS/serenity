import {
  ClientData,
  DisconnectReason,
  IdentityData,
  LoginPacket,
  LoginTokenData,
  LoginTokens,
  Packet,
  PlayStatus,
  PlayStatusPacket,
  ResourcePacksInfoPacket,
  SerializedSkin
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";
import { createDecoder } from "fast-jwt";

import { NetworkHandler } from "../network";
import { ClientSystemInfo, Player } from "../entity";
import { PlayerProperties } from "../types";
import { PlayerJoinSignal } from "../events";
import { AuthenticationType } from "@serenityjs/protocol/src/types/authentication-type";

class LoginHandler extends NetworkHandler {
  public static readonly packet = Packet.Login;

  public static decoder = createDecoder();

  public handle(packet: LoginPacket, connection: Connection): void {
    // Decode the tokens given by the client.
    // This contains the client data, identity data, and public key.
    // Along with the players XUID, display name, and uuid.
    const { clientData, identityData, authenticationType } = LoginHandler.decode(packet.tokens);

    // Check if the authentication type is valid.
    // The LoginPacket passes one of three authentication types:
    // 0 - Standard, the player is using their own token to connect.
    // 1 - The connection is coming from a guest split screen session using the host's token.
    // 2 - The connection is not authenticated.
    // By default, we do not want to allow guest or unauthenticated connections to the server.

    if (authenticationType !== AuthenticationType.Full && !this.serenity.properties.allowUnsignedConnections) {
      // Disconnect the player.
      return this.network.disconnectConnection(
        connection,
        "Failed to authenticate. Make sure you are connected to Xbox Live before joining the server.",
        DisconnectReason.NotAuthenticated
      );
    }

    // Get the clients xuid and username.
    const xuid = identityData.XUID;
    const uuid = identityData.identity;
    const username = identityData.displayName;

    // Check if the xuid is smaller than 16 characters.
    // If so then the xuid is invalid.
    // Not sure if this is the best way to check if the xuid is valid, but it works for now.
    // Possibly add a xuid resolver in the future, but may leave that up to plugins.
    if (xuid.length < 16) {
      // Disconnect the player.
      return this.network.disconnectConnection(
        connection,
        "Failed to connect due to having an invalid xuid. Make sure you are connected to Xbox Live before joining the server.",
        DisconnectReason.InvalidTenant
      );
    }

    // Check if the player is already connected.
    // And if so, disconnect the player the player currently connected.
    if (this.serenity.getPlayerByXuid(xuid)) {
      // Get the player to disconnect.
      const player = this.serenity.getPlayerByXuid(xuid) as Player;

      // Disconnect the player.
      player.disconnect(
        "You have been disconnected from the server because you logged in from another location.",
        DisconnectReason.LoggedInOtherLocation
      );
    }

    // Get the default world, and check if it is undefined.
    // If so, then disconnect the player.
    const world = this.serenity.getWorld();
    if (!world)
      return this.network.disconnectConnection(
        connection,
        "There are no worlds registered within the server process.",
        DisconnectReason.WorldCorruption
      );

    // Get the default dimension, and check if it is undefined.
    // If so, then disconnect the player.
    const dimension = world.getDimension();
    if (!dimension)
      return this.network.disconnectConnection(
        connection,
        "There are no dimensions registered within the world instance.",
        DisconnectReason.WorldCorruption
      );

    // Create a new ClientSystemInfo instance.
    const clientSystemInfo = new ClientSystemInfo(
      clientData.DeviceId,
      clientData.DeviceModel,
      clientData.DeviceOS,
      clientData.MaxViewDistance,
      clientData.MemoryTier
    );

    // Read the player storage data from the world provider.
    const storage = world.provider.readPlayer(uuid);

    // Get the skin from the client data.
    const skin = SerializedSkin.from(clientData);

    // Create the properties for the player
    const properties: Partial<PlayerProperties> = {
      username,
      xuid,
      uuid,
      clientSystemInfo,
      skin
    };

    // Assign the storage if it exists.
    if (storage) properties.storage = storage;

    // Create a new player instance.
    const player = new Player(dimension, connection, properties);

    // Set the players xuid and username.
    this.serenity.players.set(connection, player);

    // Create a new PlayerJoinSignal
    const signal = new PlayerJoinSignal(player).emit();

    // Check if the signal was cancelled.
    if (!signal)
      return player.disconnect(
        "Failed to join the server.",
        DisconnectReason.Kicked
      );

    // TODO: Enable encryption, the public key is given in the tokens
    // This is with the ClientToSeverHandshake packet & the ServerToClientHandshake packet
    // But for now, we will just send the player the login status, this will skip the encryption
    const login = new PlayStatusPacket();
    login.status = PlayStatus.LoginSuccess;

    // Create a new ResourcePacksInfoPacket
    const resources = new ResourcePacksInfoPacket();
    resources.mustAccept = this.serenity.resources.properties.mustAccept;
    resources.hasAddons = false;
    resources.hasScripts = false;
    resources.forceDisableVibrantVisuals = false;
    resources.worldTemplateUuid = "00000000-0000-0000-0000-000000000000";
    resources.worldTemplateVersion = "";
    resources.packs = this.serenity.resources.getAllPackDescriptors();

    // Log the join event to the console
    world.logger.info(
      `§8[§9${player.username}§8] Event:§r Player joined the server.`
    );

    // Send the player the login status packet and the resource pack info packet.
    player.send(login, resources);
  }

  /**
   * Decodes the login tokens and returns the data
   * @param tokens The login tokens
   * @returns The decoded login token data
   */
  public static decode(tokens: LoginTokens): LoginTokenData {
    // Contains data about the users client. (Device, game version, etc.)
    const clientData: ClientData = this.decoder(tokens.client);

    // Parse the identity data from the tokens
    const identity: { AuthenticationType: number, Certificate: string } = JSON.parse(tokens.identity);

    // Get the identity chain from the identity data
    const chains: Array<string> = JSON.parse(identity.Certificate).chain;

    // Decode the chains
    const decodedChains = chains.map((chain) => this.decoder(chain));

    // Contains mainly metadata, but also includes important XBL data (displayName, xuid, identity uuid, etc.)
    const identityData: IdentityData = decodedChains.find(
      (chain) => chain.extraData !== undefined
    )?.extraData;

    // Public key for encryption
    // TODO: Implement encryption
    const publicKey = decodedChains.find(
      (chain) => chain.identityPublicKey !== undefined
    )?.identityPublicKey;

    return {
      clientData,
      identityData,
      publicKey,
      authenticationType: identity.AuthenticationType
    };
  }
}

export { LoginHandler };
