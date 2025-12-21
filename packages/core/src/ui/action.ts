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
 * Represents an element that can be added to an action form.
 */
interface ActionFormElement {
  type: "header" | "label" | "divider" | "button";
  text?: string;
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
   * The elements of the form.
   */
  private elements: Array<ActionFormElement> = [];

  /**
   * The content of the form.
   */
  public content: string;

  /**
   * Create a new server-sided action form.
   * @param title The title of the form.
   * @param content The content of the form; defaults to an empty string.
   */
  public constructor(title: string, content?: string) {
    super(title);

    // Assignt the form content
    this.content = content ?? String();
  }

  /**
   * Clears all elements from the form.
   */
  public clearElements(): void {
    // Reset the elements array
    this.elements = [];
  }

  /**
   * Clears a specific element from the form.
   * @param index The index of the element to clear.
   */
  public clearElement(index: number): void {
    // Remove the element at the specified index
    this.elements.splice(index, 1);
  }

  /**
   * Adds a button to the form.
   */
  public button(text: string, image?: ActionFormImage): this {
    // Push the button to the buttons array
    this.elements.push({ type: "button", text, image });

    // Return this instance
    return this;
  }

  /**
   * Adds a header element to the form.
   * @param text The text of the header
   * @returns This ActionForm instance
   */
  public header(text: string): this {
    // Push the header element to the elements array
    this.elements.push({ type: "header", text });

    // Return this instance
    return this;
  }

  /**
   * Adds a label element to the form.
   * @param text The text of the label
   * @returns This ActionForm instance
   */
  public label(text: string): this {
    // Push the label element to the elements array
    this.elements.push({ type: "label", text });

    // Return this instance
    return this;
  }

  /**
   * Adds a divider element to the form.
   * @returns This ActionForm instance
   */
  public divider(): this {
    // Push the divider element to the elements array
    this.elements.push({ type: "divider", text: "" });

    // Return this instance
    return this;
  }
}

export { ActionForm, ActionFormImage, ActionFormElement };
