import { ModalFormType } from "@serenityjs/protocol";

import { Form } from "./form";

class MessageForm extends Form<boolean> {
  public readonly type = ModalFormType.Message;

  /**
   * The content of the form.
   */
  public content: string;

  /**
   * The text of the first button.
   */
  public button1: string;

  /**
   * The text of the second button.
   */
  public button2: string;

  /**
   * Create a new server-sided message form.
   * @param title The title of the form.
   * @param content The content of the form; defaults to an empty string.
   * @param button1 The text of the first button; defaults to "OK".
   * @param button2 The text of the second button; defaults to "Cancel".
   */
  public constructor(
    title: string,
    content?: string,
    button1?: string,
    button2?: string
  ) {
    super(title);

    // Assign the form properties
    this.content = content ?? String();
    this.button1 = button1 ?? "OK";
    this.button2 = button2 ?? "Cancel";
  }
}

export { MessageForm };
