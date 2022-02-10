module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true,
  },
  extends: ["plugin:vue/essential"],
  plugins: ["vue"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "prettier/prettier": "off",
    indent: "off",
    "linebreak-style": ["off", "unix"],
    quotes: ["off", "double", "avoid-escape"],
    semi: ["off", "always"],
    'vue/multi-word-component-names': 'off',
  },
  ignorePatterns: ["/dist"],
};
