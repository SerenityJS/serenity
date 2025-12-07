// NodeJS backward compatibility for Uint8Array.fromBase64
if (!Uint8Array.fromBase64) {
  // Extend Uint8Array with fromBase64 method
  Uint8Array.fromBase64 = function (
    base64String: string,
    options?: { alphabet?: "base64" | "base64url" }
  ): Uint8Array {
    return Buffer.from(base64String, options?.alphabet ?? "base64");
    /*
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;*/
  };
}

if (!Uint8Array.prototype.toHex) {
  Uint8Array.prototype.toHex = function toHex(this: Uint8Array) {
    return Buffer.prototype.toString.call(this, "hex");
  };
}
