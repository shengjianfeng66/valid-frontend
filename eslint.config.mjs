import antfu from "@antfu/eslint-config"

export default antfu({
  type: "app",
  markdown: false,
  jsonc: false,
  stylistic: false,
  react: true,
  rules: {
    "node/prefer-global/process": "off",
    "no-console": "off",
  },
})
