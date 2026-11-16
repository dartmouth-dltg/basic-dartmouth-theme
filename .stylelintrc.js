const baseConfig = require("@dltg/gulp-build/stylelint-config");
const rawRuleValue = baseConfig.rules
  ? baseConfig.rules["unit-allowed-list"]
  : null;

function getRules(rrv) {
  return Array.isArray(rrv[0]) ? rrv[0] : rrv;
}

function arrayIfString(rrv) {
  return typeof rrv === "string" ? [rrv] : [];
}

// 2. Extract the actual array of units, accounting for Stylelint's array structure
const existingUnits = Array.isArray(rawRuleValue)
  ? getRules(rawRuleValue)
  : arrayIfString(rawRuleValue);
module.exports = {
  // 2. Unpack the original configuration rules and settings
  ...baseConfig,

  // 3. Define or overwrite specific rules
  rules: {
    ...baseConfig.rules, // Keep all other existing base rules intact

    // Override the rule by combining old units with your new ones
    "unit-allowed-list": [
      [
        ...existingUnits,
        "ch", // Add your new allowed unit here
        "vh", // Add another new unit here
      ],
    ],
  },
};
