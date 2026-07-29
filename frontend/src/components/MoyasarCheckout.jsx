import React, { useEffect, useRef } from "react";

/**
 * Mounts Moyasar's hosted payment form inside `#moyasar-form`. Moyasar
 * collects the card number/CVV itself (inside its own iframe) so raw card
 * data never passes through our React state or our backend — only the
 * resulting one-time token does, in onCompleted.
 *
 * Docs: https://docs.moyasar.com/payment-form
 */
export default function MoyasarCheckout({ amountSar, description, onCompleted, onCancel, saveCard = false }) {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const publishableKey = import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY;
    if (!publishableKey || !window.Moyasar) {
      console.error("Moyasar is not configured (missing VITE_MOYASAR_PUBLISHABLE_KEY or script not loaded)");
      return;
    }

    window.Moyasar.init({
      element: "#moyasar-form",
      amount: Math.round(amountSar * 100), // halalas
      currency: "SAR",
      description,
      publishable_api_key: publishableKey,
      callback_url: window.location.href, // not used since we intercept on_completed below
      methods: ["creditcard"],
      // saveCard:true (used by the subscription billing flow) makes Moyasar
      // return a REUSABLE token in payment.source.token, so the backend can
      // charge this same card again automatically every month with no
      // customer present — see billing.js on the backend.
      save_card: saveCard,
      on_completed: (payment) => {
        // payment.source.token / payment.id are available depending on SDK version;
        // we forward the raw payment object and let the caller decide what to send.
        onCompleted(payment);
      },
    });
  }, [amountSar, description, onCompleted, saveCard]);

  return (
    <div>
      <div id="moyasar-form"></div>
      <button style={{ marginTop: 10 }} onClick={onCancel}>
        إلغاء
      </button>
    </div>
  );
}
