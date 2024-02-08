interface ActionFormImage {
	data: string;
	type: 'path' | 'url';
}

interface ActionFormButton {
	image?: ActionFormImage;
	text: string;
}

interface ActionFormJson {
	buttons: ActionFormButton[];
	content: string;
	title: string;
}

interface ActionFormResponse {
	selection: number;
}

export type { ActionFormJson, ActionFormResponse, ActionFormButton, ActionFormImage };
