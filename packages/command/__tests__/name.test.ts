import { getName } from "..";

describe("getName function", () => {
  it("should return '@serenityjs/command'", () => {
    const expectedOutput = "@serenityjs/command";
    const result = getName();
    expect(result).toBe(expectedOutput);
  });
});
