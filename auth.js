(() => {
  const authMessage = document.querySelector("#auth-message");
  const journalStatus = document.querySelector("#journal-auth-status");
  const gratitudeStatus = document.querySelector("#gratitude-auth-status");
  const siteAuthStatus = document.querySelector("#site-auth-status");
  const authMode = document.body.dataset.authMode;
  const returnToKey = "soulspace-return-to";
  const allowedReturnTargets = new Set([
    "/",
    "/journal.html",
    "/?open-finder=1",
    "/#practice-meditation",
    "/#practice-breathwork",
    "/#practice-yoga-movement",
    "/#practice-healing-music",
    "/#practice-sleep-stories",
    "/#practice-gratitude",
    "/#practice-quiet-reflection",
    "/meditation/meditation.html",
    "/breathwork/breathwork.html",
    "/yoga&movement/yoga.html",
    "/healing_music/healing_music.html",
    "/sleep_stories/sleep_stories.html",
    "/gratitude/gratitude.html",
    "/Self%20Reflection/selfReflection.html",
  ]);
  const profileMenu = document.querySelector("#profile-menu");
  const profileToggle = document.querySelector("#profile-toggle");
  const profileToggleLabel = document.querySelector("#profile-toggle-label");
  const profilePanel = document.querySelector("#profile-panel");
  const profileName = document.querySelector("#profile-name");
  const profileEmail = document.querySelector("#profile-email");
  const profileUserId = document.querySelector("#profile-user-id");
  const profileSignOut = document.querySelector("#profile-sign-out");
  let activeClerk;

  function safeReturnTarget(target) {
    return typeof target === "string" && allowedReturnTargets.has(target) ? target : "/";
  }

  function pendingReturnTarget() {
    const fromQuery = new URLSearchParams(window.location.search).get("return_to");
    if (fromQuery) return safeReturnTarget(fromQuery);
    try {
      return safeReturnTarget(window.sessionStorage.getItem(returnToKey));
    } catch {
      return "/";
    }
  }

  function clearPendingReturnTarget() {
    try {
      window.sessionStorage.removeItem(returnToKey);
    } catch {
      // The URL parameter remains available when browser storage is disabled.
    }
  }

  function restorePendingReturnTarget(clerk) {
    if (!clerk.isSignedIn) return;
    let storedTarget;
    try {
      storedTarget = window.sessionStorage.getItem(returnToKey);
    } catch {
      return;
    }
    if (!storedTarget) return;

    const destination = safeReturnTarget(storedTarget);
    clearPendingReturnTarget();
    const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (destination !== currentLocation) window.location.replace(destination);
  }

  function storeReturnTarget(target) {
    const safeTarget = safeReturnTarget(target);
    try {
      window.sessionStorage.setItem(returnToKey, safeTarget);
    } catch {
      // A same-origin URL parameter also carries the allowlisted destination.
    }
    return safeTarget;
  }

  function showError(message) {
    const target = authMessage || journalStatus || gratitudeStatus || siteAuthStatus;
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
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const detail = typeof errorBody?.detail === "string"
        ? errorBody.detail
        : `Sign-in configuration endpoint returned HTTP ${response.status}.`;
      throw new Error(detail);
    }
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
      const destination = pendingReturnTarget();
      clearPendingReturnTarget();
      window.location.replace(destination);
      return;
    }

    const returnTo = pendingReturnTarget();
    const returnQuery = `?return_to=${encodeURIComponent(returnTo)}`;
    const options = {
      routing: "hash",
      appearance: clerkAppearance(),
      fallbackRedirectUrl: returnTo,
      forceRedirectUrl: returnTo,
      signUpFallbackRedirectUrl: returnTo,
      signUpForceRedirectUrl: returnTo,
      signInUrl: `/sign-in.html${returnQuery}`,
      signUpUrl: `/sign-up.html${returnQuery}`,
    };
    if (authMode === "sign-up") {
      clerk.mountSignUp(widget, {
        ...options,
        signInUrl: `/sign-in.html${returnQuery}`,
      });
    } else {
      clerk.mountSignIn(widget, {
        ...options,
        signUpUrl: `/sign-up.html${returnQuery}`,
      });
    }
  }

  function closeProfile() {
    if (!profilePanel || !profileToggle) return;
    profilePanel.hidden = true;
    profileToggle.setAttribute("aria-expanded", "false");
  }

  function updateProfile(clerk) {
    if (!profileMenu || !clerk) return;
    const user = clerk.user;
    const isSignedIn = Boolean(clerk.isSignedIn && user);
    profileMenu.hidden = false;
    if (!isSignedIn) {
      if (profileToggleLabel) profileToggleLabel.textContent = "Sign in";
      closeProfile();
      return;
    }
    if (profileToggleLabel) profileToggleLabel.textContent = "Profile";

    const fullName = user.fullName
      || [user.firstName, user.lastName].filter(Boolean).join(" ")
      || "Not provided";
    const primaryEmail = user.primaryEmailAddress?.emailAddress
      || user.emailAddresses?.[0]?.emailAddress
      || "No email available";
    profileName.textContent = fullName;
    profileEmail.textContent = primaryEmail;
    profileUserId.textContent = user.id;
  }

  if (profileToggle && profilePanel) {
    profileToggle.addEventListener("click", async () => {
      let clerk;
      try {
        clerk = await window.soulspaceClerkReady;
      } catch {
        return;
      }
      if (!clerk.isSignedIn) {
        await window.soulspaceRequireAuth("/");
        return;
      }
      const willOpen = profilePanel.hidden;
      profilePanel.hidden = !willOpen;
      profileToggle.setAttribute("aria-expanded", String(willOpen));
    });
    document.addEventListener("click", (event) => {
      if (!profileMenu?.contains(event.target)) closeProfile();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !profilePanel.hidden) {
        closeProfile();
        profileToggle.focus();
      }
    });
  }

  if (profileSignOut) {
    profileSignOut.addEventListener("click", async () => {
      if (!activeClerk) return;
      profileSignOut.disabled = true;
      try {
        await activeClerk.signOut({ redirectUrl: "/" });
      } catch {
        profileSignOut.disabled = false;
        showError("Sign out could not be completed. Please try again.");
      }
    });
  }

  window.soulspaceRequireAuth = async (destination) => {
    try {
      const clerk = await window.soulspaceClerkReady;
      if (clerk.isSignedIn) return true;
      const returnTo = storeReturnTarget(destination);
      const signInUrl = new URL("/sign-in.html", window.location.origin);
      signInUrl.searchParams.set("return_to", returnTo);
      window.location.assign(`${signInUrl.pathname}${signInUrl.search}`);
      return false;
    } catch (error) {
      showError(error instanceof Error ? error.message : "Sign-in could not be loaded. Please try again.");
      return false;
    }
  };

  window.soulspaceClerkReady = initializeClerk()
    .then(async (clerk) => {
      activeClerk = clerk;
      updateProfile(clerk);
      if (typeof clerk.addListener === "function") {
        clerk.addListener(() => updateProfile(clerk));
      }
      restorePendingReturnTarget(clerk);
      await mountAuthPage(clerk);
      return clerk;
    })
    .catch((error) => {
      console.error("SoulSpace sign-in could not be initialized.");
      showError(error instanceof Error ? error.message : "Sign-in could not be loaded. Please try again.");
      throw error;
    });
})();
