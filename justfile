# default help menu lists tasks
@help:
  just --list --justfile {{justfile()}} --list-heading $'mash-js\n'

# format all packages
@fmt:
  yarn workspaces foreach --topological --parallel run fmt:fix

# lint all packages
@lint:
  yarn workspaces foreach --topological --parallel run lint:fix

# test all packages
@test:
  yarn references
  yarn workspaces foreach --topological --parallel run test
