export function unwrap<T>(fn: () => T, errFn: (err: unknown) => T): T {
	try {
		return fn();
	} catch (error) {
		return errFn(error);
	}
}
