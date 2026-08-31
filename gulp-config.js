module.exports = {
  gulp: {
    files: ["./gulpfile.js", "./gulp-config.js"],
  },

  product: {
    dirs: ["asset/css", "asset/js"],
    files: ["asset/css", "asset/js"],
  },

  sass: {
    sources: ["src/sass/**/*.scss"],
    destination: "asset/css",
  },

  css: {
    sources: ["asset/css/**/*.css"],
    exclude: ["asset/css/**/*.min.css"],
    destination: "asset/css",
  },

  js: {
    sources: ["src/js/**/*.js"],
    destination: "asset/js",
  },
};