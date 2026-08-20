$warn = 400
$fail = 500
Get-ChildItem -Path src -Recurse -Include '*.ts','*.tsx','*.css' | ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    $rel = $_.FullName.Replace('C:\dev\phase 10\','')
    if ($lines -ge $warn) {
        if ($lines -ge $fail) { $status = 'OVER' } else { $status = 'WARN' }
        Write-Output "$status $lines $rel"
    }
} | Sort-Object { [int]($_ -split ' ')[1] } -Descending
