import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                console: "readonly",
                process: "readonly",
                setTimeout: "readonly",
            },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-console": "off",
            "no-undef": "error",
            "no-unused-expressions": "warn",
            "no-useless-assignment": "off",
            "prefer-const": "warn",
            "no-var": "error",
        },
    },
    {
        ignores: [
            "node_modules/**",
            "coverage/**",
            "test/**",
            "docs/**",
            "2_Template_y_calidad_de_codigo/**",
        ],
    },
];
