import { CompoundTag, StringTag } from "@serenityjs/nbt";

class BookPage {
	public text: string;
	public photoName: string;

	public constructor(text: string, photoName: string = "") {
		this.text = text;
		this.photoName = photoName;
	}

	public write(): CompoundTag {
		return new CompoundTag("", {})
			.addTag(new StringTag("text", this.text))
			.addTag(new StringTag("photoname", this.photoName));
	}

	// TODO: Book Page NBT read
}

export { BookPage };
