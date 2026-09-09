<#
.SYNOPSIS
    Exports the TigerBot Thesis Robotics site into a 100% self-contained, standalone repository.

.DESCRIPTION
    This script extracts all thesis pages, stylesheets, scripts, fonts, and schematics
    from the personal portfolio into an independent directory.
    - Copies 'robotics.html' as the root 'index.html'
    - Copies all 4 platform chapter pages
    - Re-links internal references to point to 'index.html'
    - Copies 'robotics.css', 'robotics.js', FontAwesome, and JetBrains Mono fonts
    - Generates a dedicated README.md and .nojekyll file for GitHub Pages

.PARAMETER DestinationPath
    The target directory where the standalone thesis site will be built.
    Defaults to './dist-thesis'.

.EXAMPLE
    .\scripts\export_standalone_thesis.ps1 -DestinationPath "../tigerbot-thesis"
#>

[CmdletBinding()]
param (
    [string]$DestinationPath = ""
)

$ErrorActionPreference = "Stop"
$WorkspaceRoot = (Resolve-Path "$PSScriptRoot\..").Path

if ([string]::IsNullOrWhiteSpace($DestinationPath)) {
    $DestFull = "$WorkspaceRoot\dist-thesis"
} else {
    $DestFull = [System.IO.Path]::GetFullPath($DestinationPath)
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " LSU TigerBot Thesis Research - Standalone Site Exporter" -ForegroundColor Yellow
Write-Host " Source: $WorkspaceRoot" -ForegroundColor Gray
Write-Host " Destination: $DestFull" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Prepare Directory Structure
if (Test-Path $DestFull) {
    Write-Host "[1/5] Cleaning existing destination folder..." -ForegroundColor DarkGray
    Remove-Item -Path $DestFull -Recurse -Force
}

$dirs = @(
    "$DestFull\assets\css",
    "$DestFull\assets\js",
    "$DestFull\assets\fonts",
    "$DestFull\images"
)
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}
Write-Host "[1/5] Created standalone folder structure." -ForegroundColor Green

# 2. Copy Assets
Write-Host "[2/5] Copying styles, scripts, fonts, and brand assets..." -ForegroundColor DarkGray
Copy-Item "$WorkspaceRoot\assets\css\robotics.css" "$DestFull\assets\css\" -Force
Copy-Item "$WorkspaceRoot\assets\css\fontawesome-all.min.css" "$DestFull\assets\css\" -Force
Copy-Item "$WorkspaceRoot\assets\js\robotics.js" "$DestFull\assets\js\" -Force
Copy-Item "$WorkspaceRoot\images\logo.svg" "$DestFull\images\" -Force

if (Test-Path "$WorkspaceRoot\assets\fonts") {
    Copy-Item "$WorkspaceRoot\assets\fonts\*" "$DestFull\assets\fonts\" -Recurse -Force
}
Write-Host "[2/5] Core assets copied successfully." -ForegroundColor Green

# 3. Process and Copy HTML Pages
Write-Host "[3/5] Processing HTML pages (mapping robotics.html -> index.html)..." -ForegroundColor DarkGray

# A. Hub page: robotics.html becomes index.html
$hubContent = Get-Content "$WorkspaceRoot\robotics.html" -Raw -Encoding UTF8
$hubContent = $hubContent -replace 'href="robotics\.html"', 'href="index.html"'
Set-Content "$DestFull\index.html" -Value $hubContent -Encoding UTF8

# B. Chapter pages
$chapters = @("robotics-agv.html", "robotics-arm.html", "robotics-flight.html", "robotics-quadruped.html")
foreach ($ch in $chapters) {
    if (Test-Path "$WorkspaceRoot\$ch") {
        $chContent = Get-Content "$WorkspaceRoot\$ch" -Raw -Encoding UTF8
        $chContent = $chContent -replace 'href="robotics\.html"', 'href="index.html"'
        Set-Content "$DestFull\$ch" -Value $chContent -Encoding UTF8
    }
}
Write-Host "[3/5] HTML pages mapped and exported." -ForegroundColor Green

# 4. Generate Dedicated Thesis README and .nojekyll
Write-Host "[4/5] Generating thesis repository README.md and .nojekyll..." -ForegroundColor DarkGray
Set-Content "$DestFull\.nojekyll" -Value "" -Encoding UTF8

$readmeContent = @"
# Multi-Modal Autonomous Systems & Embedded Kinematic Architectures
### Engineering Thesis Research | Louisiana State University (2026)
**Author:** Gerald Lê

This repository contains the standalone documentation and research showcase site for Gerald Lê's thesis work on multi-modal autonomous systems, featuring:
- **Autonomous Ground Vehicle (AGV):** 2D LiDAR Cartographer SLAM, Nav2 costmap planning, and STM32 motor closed-loop velocity control.
- **6-DOF Robotic Manipulator:** MoveIt 2 inverse kinematics, edge YOLOv8 vision pipeline, and trajectory optimization.
- **Embedded Flight Avionics:** 1 kHz deterministic IMU SPI DMA sampling, FreeRTOS task scheduling, and EKF2 attitude estimation.
- **Quadruped Locomotion Engine:** Convex Model Predictive Control (MPC) and dynamic trot gait simulation in PyBullet.

---

## Deployment & Hosting

### Option A: GitHub Pages
1. Create a new repository on GitHub (e.g. ``username/robotics-thesis`` or ``username.github.io``).
2. Push this folder to your repository:
   ````bash
   git init
   git add .
   git commit -m "Initial commit: Standalone TigerBot Thesis Research Site"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USER>/<REPO_NAME>.git
   git push -u origin main
   ````
3. In GitHub Repository Settings -> **Pages**, set source to ``Deploy from a branch`` -> ``main`` / ``root``.

### Option B: Local Preview
Run any static HTTP server:
````bash
npx serve .
# or Python
python -m http.server 8080
````

---
&copy; 2026 Gerald Lê &bull; Louisiana State University
"@
Set-Content "$DestFull\README.md" -Value $readmeContent -Encoding UTF8
Write-Host "[4/5] Generated README.md and .nojekyll." -ForegroundColor Green

# 5. Verification
$fileCount = (Get-ChildItem -Path $DestFull -Recurse -File).Count
Write-Host "[5/5] Export complete! Total $fileCount files generated in $DestFull" -ForegroundColor Cyan
Write-Host "You can now open '$DestFull\index.html' in your browser or push '$DestFull' to a separate repo." -ForegroundColor Yellow
