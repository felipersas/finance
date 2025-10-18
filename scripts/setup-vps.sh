#!/bin/bash

# Script para configurar a VPS para CI/CD
# Execute este script na sua VPS como root ou com sudo

set -e

echo "🚀 Configurando VPS para CI/CD"
echo "================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para printar mensagens coloridas
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   print_error "Este script deve ser executado como root ou com sudo"
   exit 1
fi

# Variáveis
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_PATH="/home/${DEPLOY_USER}/mcp"
NETWORK_NAME="CodynNet"

echo ""
print_info "Configuração:"
echo "  - Usuário de deploy: ${DEPLOY_USER}"
echo "  - Diretório de deploy: ${DEPLOY_PATH}"
echo "  - Rede Docker: ${NETWORK_NAME}"
echo ""

read -p "Deseja continuar com estas configurações? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 1. Atualizar sistema
print_info "Atualizando sistema..."
apt-get update -qq
print_success "Sistema atualizado"

# 2. Instalar dependências
print_info "Instalando dependências..."
apt-get install -y -qq curl wget git rsync ca-certificates gnupg lsb-release acl > /dev/null 2>&1
print_success "Dependências instaladas"

# 3. Verificar/Instalar Docker
if ! command -v docker &> /dev/null; then
    print_info "Docker não encontrado. Instalando..."

    # Adicionar repositório Docker
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin > /dev/null 2>&1

    print_success "Docker instalado"
else
    print_success "Docker já está instalado ($(docker --version))"
fi

# 4. Verificar Docker Compose
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose não encontrado. Por favor, instale o Docker Compose."
    exit 1
else
    print_success "Docker Compose encontrado ($(docker compose version))"
fi

# 5. Criar usuário de deploy
if id "${DEPLOY_USER}" &>/dev/null; then
    print_info "Usuário ${DEPLOY_USER} já existe"
else
    print_info "Criando usuário ${DEPLOY_USER}..."
    useradd -m -s /bin/bash "${DEPLOY_USER}"
    print_success "Usuário ${DEPLOY_USER} criado"
fi

# 6. Adicionar usuário ao grupo docker
print_info "Adicionando ${DEPLOY_USER} ao grupo docker..."
usermod -aG docker "${DEPLOY_USER}"
print_success "Usuário adicionado ao grupo docker"

# 7. Configurar permissões Docker socket
print_info "Configurando permissões do Docker socket..."
setfacl -m user:${DEPLOY_USER}:rw /var/run/docker.sock
print_success "Permissões configuradas"

# 8. Criar diretório de deploy
print_info "Criando diretório de deploy..."
mkdir -p "${DEPLOY_PATH}"
chown -R ${DEPLOY_USER}:${DEPLOY_USER} "${DEPLOY_PATH}"
chmod 755 "${DEPLOY_PATH}"
print_success "Diretório criado: ${DEPLOY_PATH}"

# 9. Criar/Verificar rede Docker
print_info "Verificando rede Docker ${NETWORK_NAME}..."
if docker network ls | grep -q "${NETWORK_NAME}"; then
    print_success "Rede ${NETWORK_NAME} já existe"
else
    print_info "Criando rede ${NETWORK_NAME}..."
    docker network create ${NETWORK_NAME}
    print_success "Rede ${NETWORK_NAME} criada"
fi

# 10. Configurar SSH para o usuário deploy
print_info "Configurando SSH para ${DEPLOY_USER}..."
mkdir -p /home/${DEPLOY_USER}/.ssh
chmod 700 /home/${DEPLOY_USER}/.ssh
touch /home/${DEPLOY_USER}/.ssh/authorized_keys
chmod 600 /home/${DEPLOY_USER}/.ssh/authorized_keys
chown -R ${DEPLOY_USER}:${DEPLOY_USER} /home/${DEPLOY_USER}/.ssh
print_success "SSH configurado"

# 11. Mostrar informações para adicionar a chave SSH
echo ""
echo "================================"
print_success "Configuração da VPS concluída!"
echo "================================"
echo ""
print_info "Próximos passos:"
echo ""
echo "1. Adicione sua chave SSH pública ao arquivo:"
echo "   /home/${DEPLOY_USER}/.ssh/authorized_keys"
echo ""
echo "   Você pode fazer isso executando na sua máquina local:"
echo "   ${YELLOW}ssh-copy-id -i ~/.ssh/sua_chave.pub ${DEPLOY_USER}@$(hostname -I | awk '{print $1}')${NC}"
echo ""
echo "2. Configure os secrets no GitHub:"
echo "   - SSH_PRIVATE_KEY: conteúdo da sua chave privada"
echo "   - VPS_HOST: $(hostname -I | awk '{print $1}')"
echo "   - VPS_USER: ${DEPLOY_USER}"
echo ""
echo "3. Verifique se o Traefik está rodando:"
echo "   ${YELLOW}docker ps | grep traefik${NC}"
echo ""
echo "4. Teste a conexão SSH:"
echo "   ${YELLOW}ssh ${DEPLOY_USER}@$(hostname -I | awk '{print $1}')${NC}"
echo ""
echo "5. Teste o Docker:"
echo "   ${YELLOW}ssh ${DEPLOY_USER}@$(hostname -I | awk '{print $1}') 'docker ps'${NC}"
echo ""

# 12. Criar script de teste
cat > "${DEPLOY_PATH}/test-deploy.sh" << 'EOF'
#!/bin/bash
echo "Testing deployment setup..."
echo "✓ Directory exists: $(pwd)"
echo "✓ Docker access: $(docker ps > /dev/null 2>&1 && echo 'OK' || echo 'FAILED')"
echo "✓ Docker Compose: $(docker compose version)"
echo "✓ Network CodynNet: $(docker network ls | grep CodynNet && echo 'OK' || echo 'NOT FOUND')"
echo "Deployment setup test completed!"
EOF

chmod +x "${DEPLOY_PATH}/test-deploy.sh"
chown ${DEPLOY_USER}:${DEPLOY_USER} "${DEPLOY_PATH}/test-deploy.sh"

echo ""
print_info "Script de teste criado em: ${DEPLOY_PATH}/test-deploy.sh"
echo "   Execute: ${YELLOW}su - ${DEPLOY_USER} -c '${DEPLOY_PATH}/test-deploy.sh'${NC}"
echo ""

# 13. Executar teste
print_info "Executando teste de configuração..."
su - ${DEPLOY_USER} -c "${DEPLOY_PATH}/test-deploy.sh"

echo ""
print_success "Tudo pronto! Sua VPS está configurada para CI/CD! 🎉"
