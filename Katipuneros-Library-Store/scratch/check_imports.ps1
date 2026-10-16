$files = Get-ChildItem -Path "Frontend\src" -Recurse -Include *.tsx,*.ts
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    for ($i = 0; $i -lt $content.Count; $i++) {
        $line = $content[$i]
        if ($line -match "from ['""](.*Endpoints[^'""]*)['""]") {
            $importPath = $matches[1]
            $fileDir = $file.DirectoryName
            $resolvedPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($fileDir, $importPath))
            $existsTs = [System.IO.File]::Exists($resolvedPath + ".ts")
            $existsTsx = [System.IO.File]::Exists($resolvedPath + ".tsx")
            $existsDir = [System.IO.File]::Exists([System.IO.Path]::Combine($resolvedPath, "index.ts"))
            if (-not ($existsTs -or $existsTsx -or $existsDir)) {
                Write-Output "BROKEN: $($file.FullName):$($i+1) -> $importPath (Resolved: $resolvedPath)"
            }
        }
    }
}
