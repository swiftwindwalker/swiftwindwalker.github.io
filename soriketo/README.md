# Soriketo website

Copy the `soriketo/` folder into the root of the ravzzy.com website repository and deploy through its existing workflow. It serves the landing page at `/soriketo/`. The page uses the Koinmi site’s local Noto Sans KR fonts and includes their license. No build step is required.

The app already links to `/soriketo/#privacy-policy` and `/soriketo/#support`. Keep those anchors when updating the page. To include the page in your sitemap, add `https://www.ravzzy.com/soriketo/`.

When the public App Store listing is live, set `APP_STORE_URL` in `script.js` to the listing URL. The site will replace the development status with an App Store button. App Store Connect and TestFlight URLs are intended for their respective private and beta workflows.

The four gallery choices each have a light and dark screenshot. The eight images are optimized WebP exports from the supplied iPhone captures with the status bar cropped. The app logo and the social sharing image are included.
