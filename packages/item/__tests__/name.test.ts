import { getName } from "..";

describe("getName function", () => {
  it("should return '@serenityjs/item'", () => {
    const expectedOutput = "@serenityjs/item";
    const result = getName();
    expect(result).toBe(expectedOutput);
  });
});
