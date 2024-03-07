import type { Server } from '@serenityjs/raknet-server';
import type { Serenity } from '../index.js';

export abstract class PluginBase {
	/*
	public constructor(serenity: Serenity, server: Server) {
		this.serenity = serenity;
		this.server = server;
	}

	private _serenity!: Serenity;
	private _server!: Server;

	public get serenity(): Serenity {
		return this._serenity;
	}

	private set serenity(serenity: Serenity) {
		this._serenity = serenity;
	}

	public get server() {
		return this._server;
	}

	private set server(server: Server) {
		this._server = server;
	}

	public onEnable() {}

	public onDisable() {}
  */
}
