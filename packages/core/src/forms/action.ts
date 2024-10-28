import { ModalFormType } from "@serenityjs/protocol";

import { Form } from "./form";

/**
 * Represents an image that can be shown on an action form button.
 */
interface ActionFormImage {
  data: string;
  type: "path" | "url";
}

/**
 * Represents a button that can be shown on an action form.
 */
interface ActionFormButton {
  text: string;
  image?: ActionFormImage;
}

/**
 * These forms also contain a title and a context area, but developers can add as many buttons as they so desire. These buttons can also have textures that include either a resource path, or a url path.
 *
 * **Example Usage**
	```ts
	import { ActionForm } from "@serenityjs/server-ui"
	
	// Create a new ActionForm instance and set the title, content, and add buttons
	const form = new ActionForm()
	form.title = "ActionForm Example"
	form.content = "This is a example of a action form. This is the description of the message form."
	
	// Button with no additional data
	form.button("Button 1")
	
	// Button with a texture path
	form.button("Button 2", {
	  type: "path",
	  data: "textures/items/apple"
	})
	
	// Buttom with a url path
	form.button("Button 3", {
	  type: "url",
	  data: "https://raw.githubusercontent.com/SerenityJS/serenity/develop/public/serenityjs-logo.png"
	})
	
	// Show the form to the player
	form.show(player)
	  .then((response) => {})
	  .catch((rejected) => {})
	```
 */
class ActionForm extends Form<number> {
  public readonly type = ModalFormType.Action;

  /**
   * The title of the form.
   */
  public title!: string;

  /**
   * The content of the form.
   */
  public content!: string;

  /**
   * The buttons of the form.
   */
  public readonly buttons: Array<ActionFormButton> = [];

  /**
   * Adds a button to the form.
   */
  public button(text: string, image?: ActionFormImage): this {
    // Push the button to the buttons array
    this.buttons.push({ text, image });

    // Return this instance
    return this;
  }
}

export { ActionForm, ActionFormButton, ActionFormImage };
