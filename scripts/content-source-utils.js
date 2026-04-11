const message = [
  "Legacy content-source utilities have been retired.",
  "English pages now live directly in the checked-in HTML route files.",
  "Use scripts/static-site-utils.js when you need route discovery or HTML helpers."
].join(" ");

throw new Error(message);
