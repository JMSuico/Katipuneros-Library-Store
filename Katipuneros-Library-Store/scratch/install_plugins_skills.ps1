$skillsTarget = 'C:\Users\provu\.gemini\config\skills'

# 1. obsidian-skills
$obsidianSkills = Get-ChildItem 'C:\Users\provu\Desktop\PLUGINS\obsidian-skills\skills'
foreach ($item in $obsidianSkills) {
    $dest = Join-Path $skillsTarget $item.Name
    if (-not (Test-Path $dest)) {
        Copy-Item -Path $item.FullName -Destination $dest -Recurse -Force
        Write-Host "Installed obsidian skill: $($item.Name)"
    } else {
        Write-Host "Already exists: $($item.Name)"
    }
}

# 2. diagram-design
$diagramSrc = 'C:\Users\provu\Desktop\PLUGINS\diagram-design\skills\diagram-design'
$diagramDest = Join-Path $skillsTarget 'diagram-design'
if (Test-Path $diagramSrc) {
    if (-not (Test-Path $diagramDest)) {
        Copy-Item -Path $diagramSrc -Destination $diagramDest -Recurse -Force
        Write-Host "Installed diagram-design"
    } else {
        Write-Host "diagram-design already exists"
    }
}

# 3. task-observer
$taskObsDest = Join-Path $skillsTarget 'task-observer'
if (-not (Test-Path $taskObsDest)) { New-Item -ItemType Directory -Path $taskObsDest -Force | Out-Null }
Copy-Item 'C:\Users\provu\Desktop\PLUGINS\one-skill-to-rule-them-all\SKILL.md' -Destination "$taskObsDest\SKILL.md" -Force
Write-Host "Installed task-observer"

# 4. graphify
$graphifyDest = Join-Path $skillsTarget 'graphify'
if (-not (Test-Path $graphifyDest)) { New-Item -ItemType Directory -Path $graphifyDest -Force | Out-Null }
if (Test-Path 'C:\Users\provu\Desktop\PLUGINS\graphify\graphify\skill.md') {
    Copy-Item 'C:\Users\provu\Desktop\PLUGINS\graphify\graphify\skill.md' -Destination "$graphifyDest\SKILL.md" -Force
    Write-Host "Installed graphify"
}

# 5. agentmemory
$agentMemSrc = 'C:\Users\provu\Desktop\PLUGINS\agentmemory\plugin\skills'
if (Test-Path $agentMemSrc) {
    Copy-Item -Path "$agentMemSrc\*" -Destination $skillsTarget -Recurse -Force
    Write-Host "Installed agentmemory subskills"
}

# 6. OpenViking
$openVikingSrc = 'C:\Users\provu\Desktop\PLUGINS\OpenViking'
$ovSkills = Get-ChildItem -Path $openVikingSrc -Recurse -Filter "SKILL.md"
foreach ($ov in $ovSkills) {
    $parentDirName = $ov.Directory.Name
    $dest = Join-Path $skillsTarget $parentDirName
    if (-not (Test-Path $dest)) {
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
        Copy-Item -Path $ov.FullName -Destination "$dest\SKILL.md" -Force
        Write-Host "Installed OpenViking skill: $parentDirName"
    }
}

Write-Host "=== Installation Complete ==="
