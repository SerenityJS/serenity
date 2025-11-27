// NodeJS backward compatibility for Uint8Array.fromBase64
if (!Uint8Array.fromBase64) {
  // Extend Uint8Array with fromBase64 method
  Uint8Array.fromBase64 = function (base64String: string): Uint8Array {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  };
}
