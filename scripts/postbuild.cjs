const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");

fs.copyFileSync(path.join(dist, "index.html"), path.join(dist, "404.html"));
fs.writeFileSync(path.join(dist, ".nojekyll"), "");
const ht = path.join(root, "public", ".htaccess");
if (fs.existsSync(ht)) {
  fs.copyFileSync(ht, path.join(dist, ".htaccess"));
}
