import { getName } from "..";

describe("getName function", () => {
  it("should return '@serenityjs/network'", () => {
    const expectedOutput = "@serenityjs/network";
    const result = getName();
    expect(result).toBe(expectedOutput);
  });
});
