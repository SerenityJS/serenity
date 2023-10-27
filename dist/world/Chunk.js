"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chunk = void 0;
const binarystream_js_1 = require("binarystream.js");
const SubChunk_1 = require("./SubChunk");
const maxChunkSize = 16;
class Chunk {
    constructor(x, z) {
        this.subChunks = new Map();
        this.hasChanged = false;
        this.x = x;
        this.z = z;
    }
    getHeight() {
        return this.subChunks.size;
    }
    getTopMostEmptySubChunk() {
        let topEmpty = maxChunkSize - 1;
        while ((topEmpty >= 0 && !this.subChunks.has(topEmpty)) ||
            (this.subChunks.has(topEmpty) && this.subChunks.get(topEmpty).isEmpty())) {
            topEmpty--;
        }
        return topEmpty;
    }
    getSubChunk(y) {
        if (y < 0 || y > maxChunkSize) {
            throw new Error('SubChunk out of bounds');
        }
        return this.subChunks.get(y);
    }
    getBlock(x, y, z) {
        const subChunk = this.getSubChunk(y >> 4);
        return subChunk.getBlock(x, y & 0xf, z);
    }
    setBlock(x, y, z, block) {
        const subChunk = this.getSubChunk(y >> 4);
        subChunk.setBlock(x, y & 0xf, z, block);
        this.hasChanged = true;
    }
    serialize() {
        const stream = new binarystream_js_1.BinaryStream();
        for (let y = 0; y < 4; ++y) {
            stream.writeByte(8);
            stream.writeByte(0);
        }
        for (let y = 0; y < this.getTopMostEmptySubChunk(); ++y) {
            (this.subChunks.get(y) ?? new SubChunk_1.SubChunk()).serialize(stream);
        }
        for (let i = 0; i < 24; ++i) {
            stream.writeByte(0);
            stream.writeVarUInt(1 << 1);
        }
        stream.writeByte(0);
        return stream.getBuffer();
    }
}
exports.Chunk = Chunk;
