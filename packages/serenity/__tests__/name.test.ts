import { getName } from "..";

describe("getName function", () => {
  it("should return '@serenityjs/serenity'", () => {
    const expectedOutput = "@serenityjs/serenity";
    const result = getName();
    expect(result).toBe(expectedOutput);
  });
});
