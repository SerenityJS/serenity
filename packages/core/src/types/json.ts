interface JSONLikeObject {
  [key: string]: JSONLikeValue;
}

type JSONLikeArray = Array<JSONLikeValue>;

type JSONLikeValue = string | number | boolean | JSONLikeObject | JSONLikeArray;

export { JSONLikeObject, JSONLikeArray, JSONLikeValue };
