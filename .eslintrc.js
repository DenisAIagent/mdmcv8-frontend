// .eslintrc.js - Configuration ESLint optimisée pour MDMC avec accessibilité

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended', // Accessibilité WCAG
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    'react',
    'react-hooks',
    'react-refresh',
    'jsx-a11y',
    'import'
  ],
  rules: {
    // React optimisations
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    'react/prop-types': 'off', // Utilisation TypeScript
    'react/react-in-jsx-scope': 'off', // React 17+
    'react/jsx-uses-react': 'off',
    'react/display-name': 'warn',
    
    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Accessibilité WCAG 2.2 - Règles strictes
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/autocomplete-valid': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/control-has-associated-label': 'warn',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/html-has-lang': 'error',
    'jsx-a11y/iframe-has-title': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/lang': 'error',
    'jsx-a11y/media-has-caption': 'warn',
    'jsx-a11y/mouse-events-have-key-events': 'error',
    'jsx-a11y/no-access-key': 'error',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/no-distracting-elements': 'error',
    'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': 'error',
    'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
    'jsx-a11y/no-noninteractive-tabindex': 'error',
    'jsx-a11y/no-redundant-roles': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    'jsx-a11y/scope': 'error',
    'jsx-a11y/tabindex-no-positive': 'error',
    
    // Performance et bonnes pratiques
    'no-unused-vars': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    
    // Import/Export
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ],
    'import/no-unresolved': 'error',
    'import/no-unused-modules': 'warn',
    
    // Sécurité
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      alias: {
        map: [
          ['@', './src'],
          ['@components', './src/components'],
          ['@assets', './src/assets'],
          ['@services', './src/services'],
          ['@utils', './src/utils']
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  
  // Overrides pour fichiers spécifiques
  overrides: [
    {
      // Configuration pour les tests
      files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
      env: {
        jest: true
      },
      rules: {
        'jsx-a11y/no-autofocus': 'off' // Autorisé dans les tests
      }
    },
    {
      // Configuration pour les fichiers de configuration
      files: ['*.config.{js,ts}', '*.rc.{js,ts}'],
      rules: {
        'no-console': 'off',
        'import/no-default-export': 'off'
      }
    },
    {
      // Configuration spéciale pour main.jsx
      files: ['src/main.{js,jsx,ts,tsx}'],
      rules: {
        'jsx-a11y/no-autofocus': 'off' // Peut être nécessaire pour le focus initial
      }
    },
    {
      // Configuration pour l'admin (moins strict sur l'accessibilité)
      files: ['src/**/admin/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'jsx-a11y/click-events-have-key-events': 'warn',
        'jsx-a11y/no-static-element-interactions': 'warn',
        'jsx-a11y/control-has-associated-label': 'off'
      }
    }
  ]
};
