"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubChunk = void 0;
const Storage_1 = require("./Storage");
class SubChunk {
    constructor(storage) {
        this.storage = storage ?? new Map();
    }
    isEmpty() {
        for (const chunk of this.storage.values()) {
            if (!chunk.isEmpty()) {
                return false;
            }
        }
        return true;
    }
    getChunkStorage(y) {
        const storage = this.storage.get(y);
        if (!storage) {
            for (let i = 0; i <= y; i++) {
                if (!this.storage.has(i)) {
                    this.storage.set(i, new Storage_1.ChunkStorage());
                }
            }
        }
        return storage;
    }
    // Might work, but I'm not sure? copilot made this
    getBlock(x, y, z) {
        const chunkStorage = this.getChunkStorage(y >> 4);
        return chunkStorage.getBlock(x, y & 0xf, z);
    }
    // Might work, but I'm not sure? copilot made this
    setBlock(x, y, z, block) {
        const chunkStorage = this.getChunkStorage(y >> 4);
        chunkStorage.setBlock(x, y & 0xf, z, block);
    }
    serialize(stream) {
        stream.writeByte(8);
        stream.writeByte(this.storage.size);
        for (const chunk of this.storage.values()) {
            chunk.serialize(stream);
        }
    }
}
exports.SubChunk = SubChunk;
