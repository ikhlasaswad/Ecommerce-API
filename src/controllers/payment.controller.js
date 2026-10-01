const prisma = require("../config/database");
const stripe = require("../utils/stripe.utils");

const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.user;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to pay for this order",
      });
    }

    if (order.status === "CANCELLED") {
      return res.status(409).json({
        success: false,
        message: "Cannot pay for a cancelled order",
      });
    }

    if (order.payment?.status === "SUCCEEDED") {
      return res.status(409).json({
        success: false,
        message: "This order has already been paid",
      });
    }

    // Stripe amounts are in the smallest currency unit (cents for USD).
    const amountInCents = Math.round(Number(order.totalAmount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: { orderId: String(order.id), userId: String(userId) },
      // allow_redirects: "never" keeps this testable purely via API/CLI (no
      // return_url needed). A real frontend integration can drop this.
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    });

    // One Payment row per order (schema has orderId @unique) — create it on the
    // first attempt, or update it if the client is retrying after a failure.
    await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        provider: "STRIPE",
        transactionId: paymentIntent.id,
        amount: order.totalAmount,
        status: "PENDING",
      },
      update: {
        transactionId: paymentIntent.id,
        status: "PENDING",
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { userId, role } = req.user;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.userId !== userId && role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this payment",
      });
    }

    return res.status(200).json({
      success: true,
      data: order.payment || null,
    });
  } catch (error) {
    next(error);
  }
};

// Stripe calls this directly — no JWT here, the request is authenticated by
// verifying Stripe's signature instead (see stripe.webhookMiddleware below).
const handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw Buffer — see the express.raw() middleware on this route
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object;
        const orderId = parseInt(intent.metadata.orderId, 10);

        await prisma.$transaction([
          prisma.payment.update({
            where: { orderId },
            data: { status: "SUCCEEDED" },
          }),
          prisma.order.update({
            where: { id: orderId },
            data: { status: "CONFIRMED" },
          }),
        ]);
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object;
        const orderId = parseInt(intent.metadata.orderId, 10);

        await prisma.payment.update({
          where: { orderId },
          data: { status: "FAILED" },
        });
        // Order is left as PENDING so the customer can retry payment;
        // an admin can cancel it manually (which restores stock).
        break;
      }

      default:
        break; // ignore event types we don't act on
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return res.status(500).json({ received: false });
  }
};

module.exports = { createPaymentIntent, getPaymentStatus, handleStripeWebhook };