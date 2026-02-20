import globals from "globals"

export default [
	{
		files: ["extension/**/*.js"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.browser,
				chrome: "readonly",
				browser: "readonly",
			},
		},
		rules: {
			"no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
			"no-undef": "error",
			"no-redeclare": "error",
			eqeqeq: ["error", "always"],
			"no-const-assign": "error",
			"no-dupe-args": "error",
			"no-dupe-keys": "error",
			"no-duplicate-case": "error",
			"no-unreachable": "error",
			"no-var": "error",
			"prefer-const": "error",
		},
	},
]
