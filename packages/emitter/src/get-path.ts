import { resolve } from "path";

function getFilePath() {
  const error = new Error();
  const stack = error?.stack?.split("\n");
  // The first line is the current function, the second is the caller
  const callerLine = stack?.[3];

  // Extract the file path from the caller line
  const match = callerLine?.match(/\((.*):\d+:\d+\)/);

  if (match) {
    return resolve(match[1] ?? ""); // The file path will be in the first capturing group
  }

  return null; // If no match found
}

export { getFilePath };
