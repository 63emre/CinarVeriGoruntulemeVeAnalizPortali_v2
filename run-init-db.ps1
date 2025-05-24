#!/usr/bin/env pwsh
# Çınar Veri Görüntüleme ve Analiz Portalı - Database Initialization Wrapper

Write-Host "Çınar Veri Görüntüleme ve Analiz Portalı - Veritabanı Başlatma" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""

# Get the directory where this script is located
$wrapperDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Join-Path $wrapperDir "cinarverigoruntulemeveanalizportali"
$initScript = Join-Path $projectDir "init-db.ps1"

Write-Host "Wrapper script dizini: $wrapperDir" -ForegroundColor Cyan
Write-Host "Proje dizini: $projectDir" -ForegroundColor Cyan
Write-Host "Init script: $initScript" -ForegroundColor Cyan
Write-Host ""

# Check if the project directory exists
if (-not (Test-Path $projectDir)) {
    Write-Host "HATA: Proje dizini bulunamadı: $projectDir" -ForegroundColor Red
    Write-Host "Lütfen bu script'i doğru konumda çalıştırdığınızdan emin olun." -ForegroundColor Yellow
    exit 1
}

# Check if the init script exists
if (-not (Test-Path $initScript)) {
    Write-Host "HATA: Init script bulunamadı: $initScript" -ForegroundColor Red
    exit 1
}

# Change to project directory and run the init script
try {
    Write-Host "Proje dizinine geçiliyor ve veritabanı başlatma script'i çalıştırılıyor..." -ForegroundColor Yellow
    Write-Host ""
    
    Set-Location $projectDir
    & $initScript
    
    Write-Host ""
    Write-Host "Veritabanı başlatma işlemi tamamlandı!" -ForegroundColor Green
    
} catch {
    Write-Host "HATA: $_" -ForegroundColor Red
    exit 1
} finally {
    # Return to original directory
    Set-Location $wrapperDir
}
