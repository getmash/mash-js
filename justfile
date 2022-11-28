# default help menu lists tasks
@help:
  just --list --justfile {{justfile()}} --list-heading $'mash-js\n'

# install node and package dependencies
@install:
  nvm install 
  yarn install

# test all packages
@test:
  yarn references:check
  yarn workspaces foreach --topological --parallel run test
