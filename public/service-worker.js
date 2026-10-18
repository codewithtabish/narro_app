// public/sw.js
// SW_VERSION: 2026-10-18-03

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/* -------------------------------------------------------------------------- */
/*  Push event                                                                 */
/* -------------------------------------------------------------------------- */

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "NARRO", body: event.data.text() || "" };
  }

  const data = payload.data || {};

  /* ── SILENT push: CALL_ENDED ──────────────────────────── */
  if (data.type === "CALL_ENDED" && data.callId) {
    event.waitUntil(
      (async () => {
        const clients = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });

        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            client.postMessage({
              type: "CALL_ENDED",
              callId: data.callId,
              reason: data.reason,
            });
          }
        }

        try {
          const notifications = await self.registration.getNotifications();
          for (const n of notifications) {
            const nData = n.data || {};
            if (
              nData.type === "INCOMING_CALL" &&
              nData.callId === data.callId
            ) {
              n.close();
            }
          }
        } catch {
          /* ignore */
        }
      })(),
    );
    return;
  }

  /* ── NORMAL push (INCOMING_CALL) ──────────────────────── */
  const {
    title = "NARRO",
    body = "",
    icon = "/icons/icon-192x192.png",
    badge = "/icons/badge.png",
    tag,
    requireInteraction = false,
    actions = [],
  } = payload;

  const isCall = data?.type === "INCOMING_CALL";
  const notificationTag =
    tag || (isCall ? `call:${data.callId}` : "narro-notification");

  const options = {
    body,
    icon,
    badge,
    tag: notificationTag,
    data,
    requireInteraction: isCall || requireInteraction,
    renotify: isCall,
    vibrate: isCall ? [500, 200, 500, 200, 500, 200, 500] : [200],
    timestamp: Date.now(),
    actions: isCall
      ? [
          { action: "accept", title: "Accept" },
          { action: "decline", title: "Decline" },
        ]
      : actions,
  };

  event.waitUntil(
    (async () => {
      await self.registration
        .showNotification(title, options)
        .catch((err) => console.error("[sw] showNotification failed:", err));

      if (isCall && data.callId) {
        const clients = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });

        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            client.postMessage({
              type: "INCOMING_CALL",
              callId: data.callId,
              callerId: data.callerId || null,
              callerName: data.callerName || "Someone",
              callerAvatar: data.callerAvatar || null,
            });
          }
        }
      }
    })(),
  );
});

/* -------------------------------------------------------------------------- */
/*  Notification click                                                         */
/* -------------------------------------------------------------------------- */

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const action = event.action;

  if (data.type === "INCOMING_CALL" && data.callId) {
    const callId = data.callId;

    if (action === "accept" || (!action && callId)) {
      event.waitUntil(handleAccept(callId));
      return;
    }

    if (action === "decline") {
      event.waitUntil(handleDecline(callId));
      return;
    }
  }

  // ✅ Ignore data.url, always go to /community
  event.waitUntil(openOrFocus("/community"));
});

/* -------------------------------------------------------------------------- */
/*  Message from client                                                        */
/* -------------------------------------------------------------------------- */

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "DISMISS_CALL_NOTIFICATION") {
    self.registration
      .getNotifications()
      .then((notifications) => {
        for (const n of notifications) {
          const nData = n.data || {};
          if (nData.type !== "INCOMING_CALL") continue;
          if (!data.callId || nData.callId === data.callId) {
            n.close();
          }
        }
      })
      .catch((err) => {
        console.error("[sw] getNotifications failed:", err);
      });
  }
});

/* -------------------------------------------------------------------------- */
/*  Accept                                                                     */
/* -------------------------------------------------------------------------- */

async function handleAccept(callId) {
  await closeAllCallNotifications(callId);

  // ✅ HARDCODED: Force /community/active
  const acceptUrl = `/community/active/${callId}`;

  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of clients) {
    if (client.url.includes(self.location.origin)) {
      client.postMessage({ type: "ACCEPT_CALL", callId });
      
      if ("navigate" in client) {
        client.navigate(acceptUrl);
      }
      if ("focus" in client) {
        return client.focus();
      }
      return;
    }
  }

  if (self.clients.openWindow) {
    return self.clients.openWindow(acceptUrl);
  }
}

/* -------------------------------------------------------------------------- */
/*  Decline                                                                    */
/* -------------------------------------------------------------------------- */

async function handleDecline(callId) {
  await closeAllCallNotifications(callId);

  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of clients) {
    if (client.url.includes(self.location.origin)) {
      client.postMessage({ type: "DECLINE_CALL", callId });
    }
  }

  try {
    await fetch("/api/calls/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ callId }),
    });
  } catch (err) {
    console.error("[sw] Decline fetch failed:", err);
  }
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function closeAllCallNotifications(callId) {
  try {
    const notifications = await self.registration.getNotifications();
    for (const n of notifications) {
      const nData = n.data || {};
      if (nData.type !== "INCOMING_CALL") continue;
      if (!callId || nData.callId === callId) {
        n.close();
      }
    }
  } catch (err) {
    console.error("[sw] closeAllCallNotifications failed:", err);
  }
}

async function openOrFocus(url) {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of clients) {
    if (client.url.includes(self.location.origin) && "focus" in client) {
      if ("navigate" in client) client.navigate(url);
      return client.focus();
    }
  }

  if (self.clients.openWindow) {
    return self.clients.openWindow(url);
  }
}