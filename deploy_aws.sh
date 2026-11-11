#!/usr/bin/env bash
# ==============================================================================
# FIELDOPS - Script de Deploy Automatizado para AWS EC2 (Learner Lab)
# Sistema: Ubuntu 22.04 / 24.04 LTS (ou Debian)
# ==============================================================================

set -e

echo "=============================================================================="
echo "          FIELDOPS - DEPLOY AUTOMATIZADO NA AWS EC2 (LEARNER LAB)             "
echo "=============================================================================="

# 1. Configurar SWAP de 2GB (Essencial para builds em t2.micro / t3.small no Learner Lab)
echo "[1/5] Verificando e configurando memoria Swap (2 GB)..."
if ! swapon --show | grep -q "swapfile"; then
    echo "Criando arquivo de swap temporario para evitar Out of Memory no build..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo "Swap de 2 GB ativado com sucesso!"
else
    echo "Swap ja ativo."
fi

# 2. Atualizar pacotes do sistema
echo "[2/5] Atualizando repositorios do sistema..."
sudo apt-get update -y

# 3. Instalar Docker e Docker Compose se nao existirem
echo "[3/5] Verificando instalacao do Docker e Docker Compose..."
if ! command -v docker &> /dev/null; then
    echo "Instalando Docker Engine..."
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    sudo usermod -aG docker $USER
    echo "Docker instalado com sucesso!"
else
    echo "Docker ja esta instalado."
fi

# 4. Construir e subir os containers com Docker Compose
echo "[4/5] Executando build e subindo os servicos (PostgreSQL, Backend Spring Boot, Frontend React Nginx)..."
# Usar docker compose v2 ou docker-compose legado
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="sudo docker compose"
else
    DOCKER_COMPOSE_CMD="sudo docker-compose"
fi

$DOCKER_COMPOSE_CMD down --remove-orphans || true
$DOCKER_COMPOSE_CMD up -d --build

# 5. Obter IP Publico da Instancia e Exibir Links
echo "[5/5] Obtendo IP publico da instancia AWS EC2..."
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || curl -s ifconfig.me || echo "<IP-PUBLICO-DA-EC2>")

echo ""
echo "=============================================================================="
echo "               FIELDOPS IMPLANTADO COM SUCESSO NA AWS EC2!                   "
echo "=============================================================================="
echo ""
echo "  🌐 Frontend Web (Supervisor): http://${PUBLIC_IP}"
echo "  ⚙️ Backend API (Spring Boot): http://${PUBLIC_IP}:8080/api/v1/health"
echo "  📄 Swagger UI Interativo:    http://${PUBLIC_IP}:8080/swagger-ui.html"
echo "  🗄️ Adminer (Gestao do Banco): http://${PUBLIC_IP}:8085"
echo ""
echo "Credenciais de Acesso ao Sistema:"
echo "  - Supervisor: carlos.supervisor@fieldops.com.br / Senha@123"
echo "  - Tecnico:    marcos.tecnico@fieldops.com.br / Senha@123"
echo "  - Admin:      admin@fieldops.com.br / Senha@123"
echo ""
echo "Lembre-se de liberar no Security Group da AWS as portas:"
echo "  - 22   (SSH)"
echo "  - 80   (HTTP - Frontend Web)"
echo "  - 8080 (TCP - API REST Spring Boot e Swagger)"
echo "  - 8085 (TCP - Adminer Banco de Dados)"
echo "=============================================================================="
