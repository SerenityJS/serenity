"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serenity = void 0;
const raknet_js_1 = require("@serenityjs/raknet.js");
const logger_1 = require("./logger");
const player_1 = require("./player");
const utils_1 = require("./utils");
class Serenity extends utils_1.EventEmitter {
    constructor(address, port) {
        super();
        this.protocolVerison = 622;
        this.minecraftVersion = '1.20.40';
        this.logger = new logger_1.Logger('Serenity');
        this.address = address;
        this.port = port;
        this.raknet = new raknet_js_1.Raknet(this.protocolVerison, this.minecraftVersion);
        this.raknet.motd = 'SerenityJS';
        this.players = new Map();
    }
    start() {
        const socket = this.raknet.start(this.address, this.port);
        if (!socket)
            return this.logger.error(`Failed to start server on port "${this.port}"!`);
        socket
            .on('Listening', () => {
            this.logger.info(`Server is now listening on port "${this.port}" using protocol "${this.protocolVerison}"!`);
        })
            .on('ClientConnected', async (client) => {
            if (this.players.has(client.guid))
                return;
            const player = new player_1.Player(this, client);
            this.players.set(client.guid, player);
            const value = await this.emit('PlayerConnected', player);
            if (value)
                return this.logger.info(`Player connected with guid "${client.guid}" from "${client.remote.address}:${client.remote.port}"!`);
            return player.disconnect('Server rejected connection.'); // TODO: change
        })
            .on('ClientDisconnected', async (client) => {
            if (!this.players.has(client.guid))
                return;
            const player = this.players.get(client.guid);
            this.players.delete(client.guid);
            this.logger.info(`Player disconnected with guid "${client.guid}" from "${client.remote.address}:${client.remote.port}"!`);
            await this.emit('PlayerDisconnected', player);
        })
            .on('Encapsulated', async (buffer, client) => {
            if (!this.players.has(client.guid))
                return;
            const player = this.players.get(client.guid);
            await player.incoming(buffer);
        })
            .on('Error', (error) => {
            console.log(error);
        });
    }
}
exports.Serenity = Serenity;
