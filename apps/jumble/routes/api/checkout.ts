import { defineHandler } from "void";
import { z } from "zod";
import { buildCartView, CART_HEADER, isCartToken } from "../../src/cart";
import { isPickupDateAvailable, isPickupWindow } from "../../src/pickup";
import { createOrder } from "../../src/server/orders";
import { getPickupLocationBySlug } from "../../src/server/pickup";
import { BOX_SIZES } from "../../src/boxes";
import { deleteCart, readCart, writeCart } from "../../src/server/cart";
import { getActiveMenu } from "../../src/server/menu";
import { queues } from "void/queues";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  customerEmail: z.string().trim().email().max(160),
  customerPhone: z.string().trim().min(7).max(30),
  locationSlug: z.string().min(1).max(80),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pickupWindow: z.string().min(1).max(40),
  notes: z.string().trim().max(500).optional().default(""),
});

const PUBLIC_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makePublicId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const code = Array.from(bytes, (byte) => PUBLIC_ID_ALPHABET[byte % PUBLIC_ID_ALPHABET.length]).join("");
  return `JMB-${code}`;
}

type HandlerContext = {
  req: {
    header: (name: string) => string | undefined;
    json: () => Promise<unknown>;
  };
  json: (body: { error: string }, status: 400 | 409 | 500) => Response;
};

async function readBody(
  c: HandlerContext,
  schema: z.ZodType<z.infer<typeof checkoutSchema>>,
): Promise<z.infer<typeof checkoutSchema> | null> {
  try {
    const parsed = schema.safeParse(await c.req.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export const POST = defineHandler(async (c) => {
  const token = c.req.header(CART_HEADER);
  if (!isCartToken(token)) {
    return c.json({ error: "Start a cart session first." }, 400);
  }

  const body = await readBody(c, checkoutSchema);
  if (!body) {
    return c.json({ error: "Check the pickup details and try again." }, 400);
  }

  if (!isPickupDateAvailable(body.pickupDate) || !isPickupWindow(body.pickupWindow)) {
    return c.json({ error: "Choose an available pickup date and window." }, 400);
  }

  const [menu, location, record] = await Promise.all([
    getActiveMenu(),
    getPickupLocationBySlug(body.locationSlug),
    readCart(token),
  ]);

  if (!location) {
    return c.json({ error: "That pickup location is not available." }, 400);
  }

  const { view, pruned } = buildCartView(record, menu.flavors, BOX_SIZES);
  if (pruned.lines.length !== record.lines.length) {
    await writeCart(token, pruned);
  }

  if (view.lines.length === 0) {
    return c.json({ error: "Your box is empty." }, 409);
  }

  const publicId = makePublicId();

  try {
    const order = await createOrder({
      publicId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      locationId: location.id,
      pickupDate: body.pickupDate,
      pickupWindow: body.pickupWindow,
      notes: body.notes,
      subtotalCents: view.subtotalCents,
      items: view.lines.map((line) => ({
        flavorSlug: line.slug,
        flavorName: line.name,
        boxSize: line.size,
        boxLabel: line.boxLabel,
        quantity: line.quantity,
        priceCents: line.priceCents,
        lineTotalCents: line.lineTotalCents,
      })),
    });

    await deleteCart(token);

    try {
      await queues["order-confirmation"].send({ publicId: order.publicId });
    } catch (cause) {
      console.error("Could not enqueue order confirmation", order.publicId, cause);
    }

    return { order: { publicId: order.publicId, status: order.status } };
  } catch (cause) {
    console.error("Could not place order", cause);
    return c.json({ error: "Could not place the order. Try again." }, 500);
  }
});
