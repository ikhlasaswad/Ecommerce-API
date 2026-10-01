const Stripe = require("stripe");

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "Warning: STRIPE_SECRET_KEY is not set in .env — payment endpoints will fail until it's added."
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;