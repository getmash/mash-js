# conf

Configuration files shared by the packages in the monorepo.

## TypeScript

`tsconfig.base.json` is the base TypeScript shared by all tools and packages.

## eslint

We need to keep `.eslintrc` files out of root or LSPs will create an instance to lint the entire repository. Quickly bogs down.
