/**
 * Theme Manager for QuizFramework
 * Follows modern-web-guidance best practices:
 * - Syncs with <meta name="color-scheme">
 * - Handles system preferences & storage events
 * - Provides FOUC prevention and accessible icons
 */

(function () {
  const STORAGE_KEY = "color-scheme";

  function getSystemPreference() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function getStoredScheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function applyScheme(scheme, persist = true) {
    const meta = document.querySelector('meta[name="color-scheme"]');
    const root = document.documentElement;

    const resolvedScheme = scheme || getSystemPreference();

    // Set meta and html attribute
    if (meta) {
      meta.content = scheme ? scheme : "light dark";
    }
    root.setAttribute("data-theme", resolvedScheme);

    // Persist or clear
    if (persist) {
      try {
        if (scheme) {
          localStorage.setItem(STORAGE_KEY, scheme);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.warn("Could not save theme preference to localStorage", e);
      }
    }

    updateToggleIcons(resolvedScheme);
  }

  function updateToggleIcons(currentScheme) {
    const btn = document.getElementById("themeToggleBtn");
    const settingsBtn = document.getElementById("settingsThemeBtn");

    if (btn) {
      if (currentScheme === "dark") {
        // In Dark Mode: Show Moon icon to indicate current dark mode
        btn.innerHTML = `
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        `;
        btn.setAttribute("title", "Dark Mode active (Click to switch to Light)");
        btn.setAttribute("aria-label", "Current mode: Dark. Click to switch to Light.");
      } else {
        // In Light Mode: Show Sun icon to indicate current light mode
        btn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        `;
        btn.setAttribute("title", "Light Mode active (Click to switch to Dark)");
        btn.setAttribute("aria-label", "Current mode: Light. Click to switch to Dark.");
      }
    }

    if (settingsBtn) {
      settingsBtn.innerHTML = currentScheme === "dark" 
        ? `<span>Dark Mode (Switch)</span>` 
        : `<span>Light Mode (Switch)</span>`;
    }
  }

  function toggleTheme() {
    const currentStored = getStoredScheme();
    const currentEffective = currentStored || getSystemPreference();
    const nextScheme = currentEffective === "dark" ? "light" : "dark";

    applyScheme(nextScheme, true);
  }

  window.toggleTheme = toggleTheme;

  // Initialize
  document.addEventListener("DOMContentLoaded", () => {
    const initialScheme = getStoredScheme();
    applyScheme(initialScheme, false);

    const toggleBtn = document.getElementById("themeToggleBtn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", toggleTheme);
    }

    // Handle cross-tab storage changes
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) {
        applyScheme(e.newValue, false);
      }
    });

    // Handle OS preference changes if no manual override
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (!getStoredScheme()) {
          applyScheme(null, false);
        }
      });
    }
  });

  window.QuizTheme = {
    toggle: toggleTheme,
    apply: applyScheme,
    get: () => getStoredScheme() || getSystemPreference()
  };
})();
