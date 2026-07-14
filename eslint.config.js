import js from '@eslint/js';
import security from 'eslint-plugin-security';
import n from 'eslint-plugin-n';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    security.configs.recommended,
    n.configs['flat/recommended-module'],
    {
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
        rules: {
            'n/no-unsupported-features/es-syntax': 'off',
            'n/no-missing-import': 'off',
            'n/no-unpublished-import': 'off',
            'no-unused-vars': [
                'error',
                { args: 'after-used', argsIgnorePattern: '^_', caughtErrors: 'none' },
            ],
        },
    },
    {
        files: ['test/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.vitest,
            },
        },
        rules: {
            'security/detect-object-injection': 'off',
            'security/detect-non-literal-fs-filename': 'off',
        },
    },
    {
        ignores: ['node_modules/', 'prisma/migrations/', 'coverage/'],
    },
    prettier,
];
