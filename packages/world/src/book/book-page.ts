import { CompoundTag, StringTag } from "@serenityjs/nbt";

class BookPage {
	public text: string;
	public photoName: string;

	public constructor(text: string = "", photoName: string = "") {
		this.text = text;
		this.photoName = photoName;
	}

	/**
	 * Serializes the page data in a CompoundTag
	 * @returns The serialized page data
	 */
	public write(): CompoundTag {
		return new CompoundTag("", {})
			.addTag(new StringTag("text", this.text))
			.addTag(new StringTag("photoname", this.photoName));
	}

	/**
	 * Reads the page content from the serialized page data
	 * @param tag the serialized page data
	 */
	public read(tag: unknown): void {
		if (tag instanceof CompoundTag) {
			const { text, photoname } = (
				tag as CompoundTag<{
					text: StringTag;
					photoname?: StringTag;
				}>
			).value;
			this.text = text.value;
			this.photoName = photoname?.value ?? "";
			return;
		}
		this.text = (tag as StringTag).value;
	}
}

export { BookPage };
