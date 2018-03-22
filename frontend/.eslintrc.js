module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
        jsx: true
    }
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  // required to lint *.vue files
  plugins: [
    'html',
    'react',
  ],
  extends: [
      'react-app',
      'standard',
  ],
  'env': {
    'browser': true,
  },
  // add your custom rules here
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    'no-tabs': 'warn',
    'block-spacing': ['warn', 'always'],
    'comma-spacing': ['warn', { 'before': false, 'after': true }],
    'brace-style': ['warn', '1tbs', { 'allowSingleLine': true }],
    'comma-dangle': ['warn', 'only-multiline'],
    'semi': ['warn', 'never'],
    'padded-blocks': ['warn', 'never'],
    'import/first': ['warn', 'always'],
    'indent': ['warn', 2],
    'quotes': ['warn', 'single', { 'avoidEscape': true }],
    'one-var': ['warn', 'never'],
    'operator-linebreak': ['warn','after', { 'overrides': { '?': 'before', ':': 'before' } }],
    'space-infix-ops': ['warn', {'int32Hint': false}],
    'standard/object-curly-even-spacing': ['warn',  'either'],
    'no-constant-condition': ['warn', { 'checkLoops': false }],
    'space-before-function-paren': ['warn', {
        'anonymous': 'always',
        'named': 'always',
        'asyncArrow': 'always'
    }],
    'no-unused-vars': ['warn', {
      vars: 'all',
      args: 'all',
      ignoreRestSiblings: false,
      argsIgnorePattern: '^_',
    }],
    'template-curly-spacing': ['warn', 'never'],
    // we don't trigger on properties since the python backend returns json
    // with snake case
    'camelcase': ['warn', { properties: 'never' }],
    'key-spacing': ['warn', { 'afterColon': true }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'object-curly-spacing': ['warn', 'always'],
    'no-multiple-empty-lines': ['warn', { 'max': 1, 'maxEOF': 0 }],
    'no-multi-spaces': ['warn'],
    'prefer-const': ['error', {
        'destructuring': 'any',
        'ignoreReadBeforeAssign': false
    }],
    'arrow-spacing': ['warn', { "before": true, "after": true }],
    'space-in-parens': ['warn', 'never'],
    'no-useless-return': 'warn'
  }
}
