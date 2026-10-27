import { defineQueue } from "void";
import { confirmOrder } from "../src/server/orders";

export type OrderConfirmationMessage = {
  publicId: string;
};

export default defineQueue<OrderConfirmationMessage>(async (batch) => {
  for (const message of batch.messages) {
    try {
      await confirmOrder(message.body.publicId);
      message.ack();
    } catch (cause) {
      console.error("Could not confirm order", message.body.publicId, cause);
      message.retry({ delaySeconds: 30 });
    }
  }
});
