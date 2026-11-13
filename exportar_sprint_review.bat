@echo off
chcp 65001 >nul
title FieldOps - Preparador do Pacote de Apresentacao / Sprint Review

echo ===============================================================================
echo            FIELDOPS - PREPARADOR LIMPO DE SPRINT REVIEW E APRESENTACAO
echo ===============================================================================
echo.

set "SOURCE_DIR=%~dp0"
set "DEST_DIR=%USERPROFILE%\Desktop\FieldOps_Sprint_Review"

if exist "%DEST_DIR%" (
    echo [1/5] Limpando versao anterior em: "%DEST_DIR%"...
    rmdir /s /q "%DEST_DIR%"
)

echo [2/5] Criando pasta limpa de apresentacao: "%DEST_DIR%"...
mkdir "%DEST_DIR%"
mkdir "%DEST_DIR%\documentos"
mkdir "%DEST_DIR%\slide_apresentacao"
mkdir "%DEST_DIR%\mobile_apk"
mkdir "%DEST_DIR%\deploy_aws"

echo [3/5] Copiando arquivos essenciais da Sprint Review...
copy /y "%SOURCE_DIR%GUIA_PROJETO_E_STATUS_APRESENTACAO.md" "%DEST_DIR%\documentos\" >nul
copy /y "%SOURCE_DIR%docs\gestao\sprint_review_slide.md" "%DEST_DIR%\documentos\" >nul
copy /y "%SOURCE_DIR%docs\gestao\matriz_poder_interesse_stakeholders.md" "%DEST_DIR%\documentos\" >nul
copy /y "%SOURCE_DIR%docs\gestao\TAP.md" "%DEST_DIR%\documentos\" >nul
copy /y "%SOURCE_DIR%docker-compose.yml" "%DEST_DIR%\deploy_aws\" >nul

:: Copia do Slide HTML (com fallback do cache caso exista)
if exist "%USERPROFILE%\.gemini\antigravity\brain\969f5c0e-8d38-4543-95f0-1c490d975727\sprint_review_slide.html" (
    copy /y "%USERPROFILE%\.gemini\antigravity\brain\969f5c0e-8d38-4543-95f0-1c490d975727\sprint_review_slide.html" "%DEST_DIR%\slide_apresentacao\apresentar_slide.html" >nul
)

:: Copia do APK gerado
if exist "%SOURCE_DIR%fieldops-mobile\FieldOps-v1.0.0.apk" (
    echo [4/5] Copiando APK Android compilado (103 MB)...
    copy /y "%SOURCE_DIR%fieldops-mobile\FieldOps-v1.0.0.apk" "%DEST_DIR%\mobile_apk\" >nul
) else (
    echo [4/5] APK local nao encontrado. O link direto de download esta disponivel no Guia.
)

:: Criar atalho / arquivo LEIA-ME de instruções rápidas
(
echo ===============================================================================
echo               PACOTE DE SPRINT REVIEW E APRESENTACAO - FIELDOPS
echo ===============================================================================
echo.
echo 1. SLIDE DA SPRINT REVIEW:
echo    - Abra a pasta "slide_apresentacao" e clique duas vezes em "apresentar_slide.html".
echo    - Pressione F11 no navegador para apresentar em tela cheia.
echo.
echo 2. APK DO ANDROID:
echo    - O arquivo "FieldOps-v1.0.0.apk" esta na pasta "mobile_apk".
echo    - Pode ser instalado diretamente em qualquer celular Android ou emulador.
echo.
echo 3. DOCUMENTOS OFICIAIS DA SPRINT:
echo    - GUIA_PROJETO_E_STATUS_APRESENTACAO.md (Checklist dos 12 testes da banca - 100 pts)
echo    - matriz_poder_interesse_stakeholders.md (Matriz de Stakeholders - Fabio Carvalho)
echo    - sprint_review_slide.md (Resumo em Markdown)
echo    - TAP.md (Termo de Abertura atualizado)
echo.
echo 4. DEPLOY AWS (TESTE 01):
echo    - A pasta "deploy_aws" contem o docker-compose.yml para subir na EC2.
echo.
echo ===============================================================================
) > "%DEST_DIR%\LEIA_ME_APRESENTACAO.txt"

echo [5/5] Concluido com sucesso!
echo.
echo ===============================================================================
echo O pacote completo e limpo foi gerado na sua Area de Trabalho:
echo "%DEST_DIR%"
echo ===============================================================================
echo.
pause
