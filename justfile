# default help menu lists tasks
@help:
  just --list --justfile {{justfile()}} --list-heading $'mash-js\n'

# test all packages
@test:
  yarn references:check
  yarn workspaces foreach --topological --parallel run test
