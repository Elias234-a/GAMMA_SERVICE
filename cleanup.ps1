# Stop any running Node processes
get-process | Where-Object { $_.ProcessName -eq 'node' } | Stop-Process -Force

# Remove node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force

# Install dependencies
npm install

Write-Host "Cleanup and reinstallation complete. You can now try building again with 'npm run build'" -ForegroundColor Green
