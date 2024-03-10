import { getName } from "..";

describe("getName function", () => {
  it("should return '@serenityjs/emitter'", () => {
    const expectedOutput = "@serenityjs/emitter";
    const result = getName();
    expect(result).toBe(expectedOutput);
  });
});
