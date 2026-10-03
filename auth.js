(() => {
  const authMessage = document.querySelector("#auth-message");
  const journalStatus = document.querySelector("#journal-auth-status");
  const authMode = document.body.dataset.authMode;

  function showError(message) {
    const target = authMessage || journalStatus;
    if (!target) return;
    target.textContent = message;
    target.hidden = false;
    target.classList.add("is-error");
  }

  function loadScript(source, attributes = {}) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = source;
      script.crossOrigin = "anonymous";
      script.type = "text/javascript";
      Object.assign(script.dataset, attributes);
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", () => reject(new Error("Clerk could not be loaded.")), { once: true });
      document.head.append(script);
    });
  }

  function frontendApiOrigin(publishableKey) {
    const encodedHost = publishableKey.split("_")[2];
    if (!encodedHost) throw new Error("The sign-in configuration is invalid.");
    const decodedHost = window.atob(encodedHost).replace(/\$$/, "");
    if (!/^[a-z0-9.-]+$/i.test(decodedHost)) throw new Error("The sign-in configuration is invalid.");
    return `https://${decodedHost}`;
  }

  function clerkAppearance() {
    return {
      theme: "simple",
      options: {
        logoPlacement: "inside",
        logoLinkUrl: "/",
        logoImageUrl: `${window.location.origin}/assets/logo.svg`,
      },
      variables: {
        colorPrimary: "#d7b2e9",
        colorForeground: "#f1edf8",
        colorMutedForeground: "#aaa4bd",
        colorDanger: "#f0a9b7",
        colorBackground: "#28243d",
        colorInput: "#1b192f",
        colorInputForeground: "#f1edf8",
        colorNeutral: "#857b9e",
        fontFamily: '"DM Sans", "Avenir Next", sans-serif',
        borderRadius: "0.8rem",
      },
      elements: {
        rootBox: { width: "100%", margin: "0 auto" },
        cardBox: {
          width: "100%",
          maxWidth: "440px",
          overflow: "hidden",
          backgroundColor: "#28243d",
          border: "1px solid rgba(209, 193, 239, 0.18)",
          borderRadius: "18px",
        },
        card: { backgroundColor: "transparent", boxShadow: "none", border: "none" },
        footer: { backgroundColor: "transparent", boxShadow: "none", border: "none" },
        headerTitle: { color: "#f1edf8" },
        headerSubtitle: { color: "#c1b9d0" },
        formFieldLabel: { color: "#e5deef" },
        socialButtonsBlockButtonText: { color: "#f1edf8" },
        footerActionText: { color: "#c1b9d0" },
        footerActionLink: { color: "#e1c2ee" },
        dividerText: { color: "#c1b9d0" },
      },
    };
  }

  async function initializeClerk() {
    const response = await fetch("/api/auth/config", { credentials: "same-origin" });
    if (!response.ok) throw new Error("Sign-in is not available right now.");
    const config = await response.json();
    if (typeof config.publishableKey !== "string" || !config.publishableKey) {
      throw new Error("Sign-in is not configured.");
    }

    const proxyUrl = typeof config.proxyUrl === "string" && config.proxyUrl.trim()
      ? config.proxyUrl.trim()
      : undefined;
    const clerkBase = proxyUrl
      ? new URL(proxyUrl, window.location.origin).href.replace(/\/$/, "")
      : frontendApiOrigin(config.publishableKey);

    await loadScript(`${clerkBase}/npm/@clerk/ui@1/dist/ui.browser.js`);
    await loadScript(`${clerkBase}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`, {
      clerkPublishableKey: config.publishableKey,
      ...(proxyUrl ? { clerkProxyUrl: proxyUrl } : {}),
    });

    if (!window.Clerk) throw new Error("Clerk did not initialize.");
    await window.Clerk.load({
      proxyUrl,
      appearance: clerkAppearance(),
      ui: { ClerkUI: window.__internal_ClerkUICtor },
      localization: {
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to revisit your journal",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Make a private space for your journal",
          },
        },
      },
    });
    return window.Clerk;
  }

  async function mountAuthPage(clerk) {
    const widget = document.querySelector("#clerk-widget");
    if (!widget) return;
    if (clerk.isSignedIn) {
      window.location.replace("journal.html");
      return;
    }

    const options = {
      routing: "hash",
      appearance: clerkAppearance(),
      fallbackRedirectUrl: "/journal.html",
      forceRedirectUrl: "/journal.html",
      signUpFallbackRedirectUrl: "/journal.html",
      signUpForceRedirectUrl: "/journal.html",
      signInUrl: "/sign-in.html",
      signUpUrl: "/sign-up.html",
    };
    if (authMode === "sign-up") {
      clerk.mountSignUp(widget, {
        ...options,
        signInUrl: "/sign-in.html",
      });
    } else {
      clerk.mountSignIn(widget, {
        ...options,
        signUpUrl: "/sign-up.html",
      });
    }
  }

  window.soulspaceClerkReady = initializeClerk()
    .then(async (clerk) => {
      await mountAuthPage(clerk);
      return clerk;
    })
    .catch((error) => {
      console.error("SoulSpace sign-in could not be initialized.");
      showError(error instanceof Error ? error.message : "Sign-in could not be loaded. Please try again.");
      throw error;
    });
})();