import { ModalFormType } from "@serenityjs/protocol";

import { Form } from "./form";

class MessageForm extends Form<boolean> {
  public readonly type = ModalFormType.Message;

  /**
   * The title of the form.
   */
  public title!: string;

  /**
   * The content of the form.
   */
  public content!: string;

  /**
   * The text of the first button.
   */
  public button1!: string;

  /**
   * The text of the second button.
   */
  public button2!: string;
}

export { MessageForm };
