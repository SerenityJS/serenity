interface MessageFormJson {
	button1: string;
	button2: string;
	content: string;
	title: string;
}

interface MessageFormResponse {
	selection: 0 | 1;
}

export type { MessageFormJson, MessageFormResponse };
