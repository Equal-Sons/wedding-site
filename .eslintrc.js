module.exports = {
	extends: [
		'xo',
		'xo-typescript',
	],
	plugins: ['@typescript-eslint'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: './tsconfig.json',
	},
	rules: {
		'@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
		'@typescript-eslint/naming-convention': 'off',
		'@typescript-eslint/object-curly-spacing': ['error', 'always'],
		'@typescript-eslint/no-unsafe-assignment': 'off',
		'@typescript-eslint/no-unsafe-call': 'off',
		'capitalized-comments': 'off',
		'arrow-parens': ['error', 'always'],
		'no-shadow': 2,
		'object-curly-spacing': ['error', 'always'],
	},
	ignorePatterns: [
		'js/**/*.js',
	],
};

