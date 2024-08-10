import type { ClientData, DeviceOS } from "@serenityjs/protocol";

class Device {
	/**
	 * The identifier of the device.
	 * This is a uuid string.
	 */
	public readonly identifier: string;

	/**
	 * The model of the device.
	 */
	public readonly model: string;

	/**
	 * The operating system of the device.
	 */
	public readonly os: DeviceOS;

	/**
	 * Creates a new device information object.
	 * @param data The client data.
	 */
	public constructor(data: ClientData) {
		this.identifier = data.DeviceId;
		this.model = data.DeviceModel;
		this.os = data.DeviceOS;
	}
}

export { Device };
