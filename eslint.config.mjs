import antfu from "@antfu/eslint-config"

export default antfu({
  type: "app",
  markdown: false,
  jsonc: false,
  stylistic: false,
  rules: {
    "node/prefer-global/process": false,
  },
})
