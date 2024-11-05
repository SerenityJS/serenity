#!/usr/bin/env node

const { readFileSync, existsSync, mkdirSync, writeFileSync } = require("fs");
const { resolve } = require("node:path");
const { deflateSync } = require("node:zlib");

const { BinaryStream } = require("@serenityjs/binarystream");

// Get the input and output paths from the command line arguments
const inputPath = process.argv[2];
const outputPath = process.argv[3];
const fileName = process.argv[4] || "my-plugin";

// Check if the input path exists
if (!existsSync(inputPath)) {
  console.error(`Input path "${inputPath}" does not exist.`);
  process.exit(1);
}

// Create the output directory if it does not exist
if (!existsSync(outputPath)) {
  mkdirSync(outputPath, { recursive: true });
}

// Read the ESM and CJS index files from the input path
const esmIndex = readFileSync(resolve(inputPath, "index.mjs"));
const cjsIndex = readFileSync(resolve(inputPath, "index.js"));

// Create a new BinaryStream instance
const stream = new BinaryStream();

// Write the length of the ESM index file and then write the compressed ESM index file
stream.writeVarInt(esmIndex.length);
stream.writeBuffer(esmIndex);

// Write the length of the CJS index file and then write the compressed CJS index file
stream.writeVarInt(cjsIndex.length);
stream.writeBuffer(cjsIndex);

// Get the buffer from the BinaryStream
const buffer = stream.getBuffer();

// Write the BinaryStream to the output path
writeFileSync(resolve(outputPath, `${fileName}.plugin`), deflateSync(buffer));
