const fs = require("fs");

// To replace the muse.js with a custom js file to fix some issues.
hexo.extend.filter.register("after_generate", () => {
  const jsBuffer = fs.readFileSync("source/_data/js/modified-muse.js");
  hexo.route.set("js/schemes/muse.js", jsBuffer);
});
