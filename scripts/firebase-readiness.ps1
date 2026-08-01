$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repositoryRoot

try {
  & node scripts/firebase-readiness.mjs @args
  exit $LASTEXITCODE
}
finally {
  Pop-Location
}
