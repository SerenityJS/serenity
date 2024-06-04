const TSCONFIG_TEMPLATE = /* json */ `{
  "extends": "@serenityjs/typescript-config/base.json",
  "compilerOptions": {
    "lib": ["es2022"],
    "outDir": "./dist",
    "types": ["node"]
  },
  "include": ["."],
  "exclude": ["node_modules", "dist"],
}
`;

export { TSCONFIG_TEMPLATE };
