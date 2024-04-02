# @serenityjs/binarystream

Binarystream is a simple Rust package designed to simplify the streaming of binary data in Javascript and Typescript. While containing the super speeds of Rust, and the ecosystem of Javascript!

## Example Usage

```ts
import { BinaryStream } from "@serenityjs/binarystream"

// Create a new stream without a given buffer.
const stream = new BinaryStream()

// Reading / Writing is allowed on the fly,
// which will automatically update the cursor offset depending on the type of call.
stream.writeUint8(255)
stream.writeString16("Hello, World!")

// Converting the stream to a buffer!
const buffer = stream.getBuffer()

// Create another stream based on our output buffer from the previous stream.
const output = new BinaryStream(buffer)

// Reading the data in order.
stream.readUint8() // Expected output: 255
stream.readString16() // Expected output: "Hello, World!"

```