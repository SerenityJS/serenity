import { getName } from "..";

describe("getName function", () => {
  it("should return '@serenityjs/world'", () => {
    const expectedOutput = "@serenityjs/world";
    const result = getName();
    expect(result).toBe(expectedOutput);
  });
});
