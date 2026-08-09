<#
.SYNOPSIS
    Manually triggers the "Deploy gleks-ui-lab" GitHub Actions workflow and
    streams its progress. Requires the GitHub CLI (`gh`) authenticated
    against the GuildOfGleks/gleks_web_ui repo.

.PARAMETER Ref
    Branch, tag, or commit SHA to build. Defaults to the current branch.

.PARAMETER ImageTag
    Docker tag to build and deploy. Defaults to "latest".

.PARAMETER HostPort
    Port to expose on the server. Defaults to "9001".

.EXAMPLE
    ./scripts/deploy-lab.ps1
    ./scripts/deploy-lab.ps1 -Ref master -ImageTag v1 -HostPort 9001
#>
param(
    [string]$Ref = (git rev-parse --abbrev-ref HEAD),
    [string]$ImageTag = "latest",
    [string]$HostPort = "9001"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI (gh) not found. Install it from https://cli.github.com/ and run 'gh auth login'."
}

Write-Host "Triggering deploy-lab.yml on ref '$Ref' (tag=$ImageTag, port=$HostPort)..." -ForegroundColor Cyan

gh workflow run deploy-lab.yml `
    --ref $Ref `
    -f image_tag=$ImageTag `
    -f host_port=$HostPort

if ($LASTEXITCODE -ne 0) {
    throw "Failed to dispatch workflow."
}

# Give GitHub a moment to register the new run before we query for it.
Start-Sleep -Seconds 5

$runId = gh run list --workflow=deploy-lab.yml --limit 1 --json databaseId --jq ".[0].databaseId"

if (-not $runId) {
    Write-Warning "Could not resolve the new run ID automatically. Check status with: gh run list --workflow=deploy-lab.yml"
    return
}

Write-Host "Watching run $runId..." -ForegroundColor Cyan
gh run watch $runId --exit-status
