"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkStorage = void 0;
const binarystream_js_1 = require("binarystream.js");
class ChunkStorage {
    constructor() {
        this.blocks = Array.from({ length: 4096 }).fill(0);
        this.palette = [0];
    }
    getIndex(x, y, z) {
        return (x << 8) | (z << 4) | y;
    }
    getBlock(x, y, z) {
        return this.blocks[this.getIndex(x, y, z)];
    }
    setBlock(x, y, z, block) {
        this.blocks[this.getIndex(x, y, z)] = block;
    }
    isEmpty() {
        return this.palette.length === 1;
    }
    serialize(stream) {
        let bitsPerBlock = Math.ceil(Math.log2(this.palette.length));
        switch (bitsPerBlock) {
            case 0:
                bitsPerBlock = 1;
                break;
            case 6:
                break;
            case 8:
                bitsPerBlock = 8;
                break;
            default:
                bitsPerBlock = 16;
                break;
        }
        stream.writeByte((bitsPerBlock << 1) | 1);
        const blocksPerWord = Math.floor(32 / bitsPerBlock);
        const wordsPerChunk = Math.ceil(4096 / blocksPerWord);
        let pos = 0;
        for (let word = 0; word < wordsPerChunk; word++) {
            let wordValue = 0;
            for (let block = 0; block < blocksPerWord; block++) {
                const blockValue = this.blocks[pos++];
                wordValue |= blockValue << (block * bitsPerBlock);
            }
            stream.writeInt32(wordValue, binarystream_js_1.Endianness.Little);
        }
        stream.writeVarInt(this.palette.length);
        for (const block of this.palette) {
            stream.writeVarInt(block);
        }
    }
}
exports.ChunkStorage = ChunkStorage;
