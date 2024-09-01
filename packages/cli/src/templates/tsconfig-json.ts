const TSCONFIG_TEMPLATE = /* json */ `{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "lib": ["es2022", "DOM", "DOM.Iterable"],
    "module": "NodeNext",
    "moduleDetection": "force",
    "moduleResolution": "NodeNext",
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true,
    "target": "ES2022",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["./src/**/*.ts"],
  "exclude": ["dist", "node_modules"],
}
`;

export { TSCONFIG_TEMPLATE };
