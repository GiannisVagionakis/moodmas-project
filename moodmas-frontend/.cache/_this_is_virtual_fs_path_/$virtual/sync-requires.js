
// prefer default export if available
const preferDefault = m => (m && m.default) || m


exports.components = {
  "component---cache-dev-404-page-js": preferDefault(require("/Users/idimou/Desktop/hackathon/moodmas-frontend/.cache/dev-404-page.js")),
  "component---src-pages-index-tsx": preferDefault(require("/Users/idimou/Desktop/hackathon/moodmas-frontend/src/pages/index.tsx"))
}

