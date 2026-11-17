# Koinmi Website Update

Replace your existing `koinmi/` website folder with this folder, preserving its assets and local fonts. No build step, package install or external JavaScript dependency is required.

## Updated Content

- Five-tab feature tour: Overview, Activity, Plan, Insights and Settings.
- Seven supplied app screenshots, optimised as WebP without changing their visual content.
- Overview appearance previews: Light Grey, Dark Grey and Dark Lilac. The other tabs use the supplied light screenshots.
- Updated Free and Pro descriptions, loan tracking, recurring entries, reminders, reports, receipt scanning, privacy, currency formatting and backup behaviour.
- Revised privacy policy and support answers reflecting the current app.
- Original local fonts, colour palette, hero phone-stack animation, scroll effects and disclosure interactions retained.

## App Store Link

The supplied site did not have a public App Store URL. The coming-soon state remains. After launch, set `APP_STORE_URL` near the bottom of `script.js` to your real `https://apps.apple.com/...` URL. Do not use a TestFlight or App Store Connect URL.

## Preview

Open `index.html` in a browser, or serve the folder using a static development server. Check desktop and phone layouts before deployment.

## Validation

JavaScript syntax, local asset paths, section links, unique IDs and screenshot files were checked. DOM-mock checks covered all five feature tabs, appearance buttons, keyboard selection, policy disclosures and deep links. The original stylesheet is retained with additional rules appended.

Full browser rendering could not be tested in this execution environment; verify visual layout in Safari/Chrome before publishing. This package does not publish or change your live website.

## Screenshot Files

| Supplied Screenshot | Website Asset |
| --- | --- |
| IMG_2136.PNG | assets/screenshots/overview-light.webp |
| IMG_2137.PNG | assets/screenshots/activity-light.webp |
| IMG_2138.PNG | assets/screenshots/plan-light.webp |
| IMG_2139.PNG | assets/screenshots/insights-light.webp |
| IMG_2140.PNG | assets/screenshots/settings-light.webp |
| IMG_2141.PNG | assets/screenshots/overview-dark-grey.webp |
| IMG_2142.PNG | assets/screenshots/overview-dark-lilac.webp |
