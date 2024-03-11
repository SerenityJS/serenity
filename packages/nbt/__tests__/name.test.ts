import { getName } from "..";

describe("getName function", () => {
  it("should return '@serenityjs/nbt'", () => {
    const expectedOutput = "@serenityjs/nbt";
    const result = getName();
    expect(result).toBe(expectedOutput);
  });
});
