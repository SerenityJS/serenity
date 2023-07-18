export function getPropertyKeysFromNativeObject<T extends object>(obj: T): (keyof T)[] {
	const keys = Object.getOwnPropertyNames(Object.getPrototypeOf(obj)) as (keyof T)[];
	return keys.filter((key) => typeof obj[key] !== 'function');
}

export function getNativeObjectAsJsObject<T extends object>(obj: T): T {
	const jsObj = {} as T;
	const keys = getPropertyKeysFromNativeObject(obj);
	for (const key of keys) {
		if (typeof obj[key] === 'object') {
			jsObj[key] = getNativeObjectAsJsObject(obj[key]);
		} else {
			jsObj[key] = obj[key];
		}
	}

	return jsObj;
}
