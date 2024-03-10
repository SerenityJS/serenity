import { getName } from "..";

describe("getName function", () => {
  it("should return '@serenityjs/protocol'", () => {
    const expectedOutput = "@serenityjs/protocol";
    const result = getName();
    expect(result).toBe(expectedOutput);
  });
});
