# ==============================================================================
# Script de Exportacao Limpa da Sprint Review & Apresentacao — FieldOps
# ==============================================================================

param(
    [string]$Destino = "$HOME\Desktop\FieldOps_Sprint_Review"
)

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "         FIELDOPS - EXPORTADOR LIMPO DE SPRINT REVIEW E APRESENTACAO" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$SourceDir = $PSScriptRoot

if (Test-Path $Destino) {
    Write-Host "[1/5] Limpando versao anterior em: $Destino..." -ForegroundColor Yellow
    Remove-Item -Path $Destino -Recurse -Force
}

Write-Host "[2/5] Criando estrutura de pastas limpa..." -ForegroundColor Green
$null = New-Item -ItemType Directory -Path "$Destino\documentos" -Force
$null = New-Item -ItemType Directory -Path "$Destino\slide_apresentacao" -Force
$null = New-Item -ItemType Directory -Path "$Destino\mobile_apk" -Force
$null = New-Item -ItemType Directory -Path "$Destino\deploy_aws" -Force

Write-Host "[3/5] Copiando arquivos essenciais da Sprint Review..." -ForegroundColor Green
Copy-Item "$SourceDir\GUIA_PROJETO_E_STATUS_APRESENTACAO.md" "$Destino\documentos\" -Force
Copy-Item "$SourceDir\docs\gestao\sprint_review_slide.md" "$Destino\documentos\" -Force
Copy-Item "$SourceDir\docs\gestao\matriz_poder_interesse_stakeholders.md" "$Destino\documentos\" -Force
Copy-Item "$SourceDir\docs\gestao\TAP.md" "$Destino\documentos\" -Force
Copy-Item "$SourceDir\docker-compose.yml" "$Destino\deploy_aws\" -Force

# Copiar Slide HTML interativo
$slideOrigem = "$HOME\.gemini\antigravity\brain\969f5c0e-8d38-4543-95f0-1c490d975727\sprint_review_slide.html"
if (Test-Path $slideOrigem) {
    Copy-Item $slideOrigem "$Destino\slide_apresentacao\apresentar_slide.html" -Force
}

# Copiar APK
$apkOrigem = "$SourceDir\fieldops-mobile\FieldOps-v1.0.0.apk"
if (Test-Path $apkOrigem) {
    Write-Host "[4/5] Copiando APK compilado do Android (103 MB)..." -ForegroundColor Green
    Copy-Item $apkOrigem "$Destino\mobile_apk\" -Force
} else {
    Write-Host "[4/5] APK local nao encontrado (link disponivel no guia)." -ForegroundColor Yellow
}

# Criar Guia Rapido
$leiaMe = @"
===============================================================================
              PACOTE DE SPRINT REVIEW E APRESENTACAO - FIELDOPS
===============================================================================

1. SLIDE DA SPRINT REVIEW:
   - Abra a pasta 'slide_apresentacao' e clique duas vezes em 'apresentar_slide.html'.
   - Pressione F11 no navegador para modo tela cheia.

2. APK DO ANDROID:
   - O arquivo 'FieldOps-v1.0.0.apk' esta na pasta 'mobile_apk'.
   - Pronto para instalar em celular Android ou enviar por WhatsApp/Drive.

3. DOCUMENTOS OFICIAIS:
   - GUIA_PROJETO_E_STATUS_APRESENTACAO.md (12 testes oficiais da banca - 100 pts)
   - matriz_poder_interesse_stakeholders.md (Matriz de Stakeholders - Fabio Carvalho)
   - sprint_review_slide.md (Slide em formato Markdown)
   - TAP.md (Termo de Abertura atualizado)

4. DEPLOY AWS (TESTE 01):
   - A pasta 'deploy_aws' contem o docker-compose.yml para subir na EC2.

===============================================================================
"@
Set-Content -Path "$Destino\LEIA_ME_APRESENTACAO.txt" -Value $leiaMe -Encoding utf8

Write-Host "[5/5] Concluido com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "Pacote limpo gerado em:" -ForegroundColor Cyan
Write-Host "$Destino" -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""
