import type { Command } from '../Command.js';
import { VersionCommand } from './VersionCommand.js';

const DefaultCommands: Command[] = [new VersionCommand];

export { DefaultCommands };

export * from './VersionCommand.js';
