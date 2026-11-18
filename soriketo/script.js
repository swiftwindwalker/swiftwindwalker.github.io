const heroStage = document.querySelector(".hero-stage");
const heroMotion = window.matchMedia("(prefers-reduced-motion: no-preference)");
let heroFrame = null;

function updateHeroMotion() {
  heroFrame = null;
  const distance = Math.max(window.innerHeight * .8, 360);
  const progress = Math.min(1, Math.max(0, window.scrollY / distance));
  heroStage.style.setProperty("--hero-progress", progress);
}

function scheduleHeroMotion() {
  if (heroMotion.matches && heroFrame === null) {
    heroFrame = requestAnimationFrame(updateHeroMotion);
  }
}

window.addEventListener("scroll", scheduleHeroMotion, { passive: true });
window.addEventListener("resize", scheduleHeroMotion);
heroMotion.addEventListener("change", scheduleHeroMotion);
scheduleHeroMotion();

const screenshots = {
  edition: ["Your Edition", "Soriketo’s edition with topic filters and an illustrated lead story"],
  saved: ["Saved Stories", "Soriketo’s Saved Stories with articles on space, nature and travel"],
  profile: ["Your Reading Room", "Soriketo’s reader profile with the optional Tip Jar, flair collection and library"],
  settings: ["Make It Yours", "Soriketo settings for topics, sources, appearance, reading and backups"]
};

const screenButtons = document.querySelectorAll("[data-screen]");
const appearanceButtons = document.querySelectorAll("[data-appearance]");
const screenDisplay = document.querySelector(".screen-display");
const screenshot = document.querySelector("#tour-image");
const caption = document.querySelector("#tour-caption");
let screen = "edition";
let appearance = "light";

function showScreenshot() {
  const [title, description] = screenshots[screen];
  screenshot.src = `assets/screens/${screen}-${appearance}.webp`;
  screenshot.alt = `${description}, in ${appearance} mode`;
  screenDisplay.dataset.mode = appearance;
  caption.textContent = `${title} · ${appearance === "light" ? "Light" : "Dark"} mode`;

  for (const button of screenButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.screen === screen));
  }
  for (const button of appearanceButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.appearance === appearance));
  }
}

for (const button of screenButtons) {
  button.addEventListener("click", () => {
    screen = button.dataset.screen;
    showScreenshot();
  });
}

for (const button of appearanceButtons) {
  button.addEventListener("click", () => {
    appearance = button.dataset.appearance;
    showScreenshot();
  });
}

function openPolicyLink() {
  if (location.hash === "#privacy-policy") {
    document.querySelector("#privacy-policy details").open = true;
  }
}

openPolicyLink();
window.addEventListener("hashchange", openPolicyLink);

// Supply the public product URL after the app launches.
const APP_STORE_URL = "";
if (APP_STORE_URL.startsWith("https://apps.apple.com/")) {
  const storeLink = document.querySelector("#store-link");
  storeLink.href = APP_STORE_URL;
  storeLink.hidden = false;
  document.querySelector("#launch-status").hidden = true;
}
