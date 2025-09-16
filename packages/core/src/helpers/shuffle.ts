function shuffle<T>(array: T[]): T[] {
  const shuffledArray = [...array];

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const x = Math.floor(Math.random() * (i + 1));
    //@ts-ignore
    [shuffledArray[i], shuffledArray[x]] = [shuffledArray[x], shuffledArray[i]];
  }

  return shuffledArray;
}

export { shuffle }