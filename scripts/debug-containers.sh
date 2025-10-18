#!/bin/bash

# Script para debugar containers que não iniciam
# Execute na VPS: bash scripts/debug-containers.sh

set -e

echo "🔍 Debug de Containers - MCP Production"
echo "========================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para printar mensagens coloridas
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "docker-compose.prod.yml não encontrado!"
    echo "Execute este script no diretório do projeto: /home/deploy/mcp"
    exit 1
fi

print_success "Arquivo docker-compose.prod.yml encontrado"
echo ""

# 1. Verificar arquivo .env
print_info "1. Verificando arquivo .env..."
if [ -f ".env" ]; then
    print_success ".env existe"
    echo "   Primeiras variáveis:"
    grep -E "^[A-Z_]+=" .env | cut -d= -f1 | head -5 | sed 's/^/   - /'
    echo ""

    # Verificar variáveis críticas
    print_info "   Verificando variáveis críticas:"
    CRITICAL_VARS=("POSTGRES_USER" "POSTGRES_PASSWORD" "POSTGRES_DB" "JWT_SECRET" "OPENAI_API_KEY")
    for var in "${CRITICAL_VARS[@]}"; do
        if grep -q "^${var}=" .env; then
            print_success "   $var definido"
        else
            print_error "   $var NÃO encontrado!"
        fi
    done
else
    print_error ".env NÃO existe!"
    echo "   Copie o arquivo .env.prod:"
    echo "   cp .env.prod .env"
    exit 1
fi
echo ""

# 2. Status dos containers
print_info "2. Status dos containers..."
docker compose -f docker-compose.prod.yml ps
echo ""

# 3. Listar todos os containers (incluindo stopped)
print_info "3. Containers detalhados..."
docker compose -f docker-compose.prod.yml ps -a
echo ""

# 4. Verificar estado de cada container
print_info "4. Estado individual dos containers..."
CONTAINERS=("pgvector-db-prod" "codyn-mastra-prod" "mcp-api-prod")
for container in "${CONTAINERS[@]}"; do
    if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
        STATE=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null || echo "not found")
        HEALTH=$(docker inspect -f '{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no healthcheck")

        echo "   Container: $container"
        echo "   Estado: $STATE"
        if [ "$HEALTH" != "no healthcheck" ]; then
            echo "   Health: $HEALTH"
        fi

        if [ "$STATE" != "running" ]; then
            print_error "   ⚠️  Container não está rodando!"
            EXIT_CODE=$(docker inspect -f '{{.State.ExitCode}}' "$container" 2>/dev/null || echo "N/A")
            echo "   Exit Code: $EXIT_CODE"
        fi
        echo ""
    else
        print_warning "   Container $container não encontrado"
        echo ""
    fi
done

# 5. Logs dos containers
print_info "5. Últimas 30 linhas de log de cada container..."
echo ""
for container in "${CONTAINERS[@]}"; do
    if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
        echo "=== Logs: $container ==="
        docker logs --tail=30 "$container" 2>&1 || echo "Não foi possível obter logs"
        echo ""
    fi
done

# 6. Verificar redes
print_info "6. Verificando redes Docker..."
NETWORKS=("mcp-network-prod" "CodynNet")
for network in "${NETWORKS[@]}"; do
    if docker network ls | grep -q "$network"; then
        print_success "   Rede $network existe"
        CONNECTED=$(docker network inspect "$network" -f '{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null)
        if [ -n "$CONNECTED" ]; then
            echo "      Containers conectados: $CONNECTED"
        else
            print_warning "      Nenhum container conectado"
        fi
    else
        print_error "   Rede $network NÃO existe!"
        echo "      Crie com: docker network create $network"
    fi
done
echo ""

# 7. Verificar volumes
print_info "7. Verificando volumes..."
VOLUMES=("pgdata_prod")
for volume in "${VOLUMES[@]}"; do
    if docker volume ls | grep -q "$volume"; then
        print_success "   Volume $volume existe"
    else
        print_warning "   Volume $volume não existe (será criado automaticamente)"
    fi
done
echo ""

# 8. Verificar portas
print_info "8. Verificando portas em uso..."
PORTS=("5432" "3000" "4111")
for port in "${PORTS[@]}"; do
    if netstat -tuln 2>/dev/null | grep -q ":${port} " || ss -tuln 2>/dev/null | grep -q ":${port} "; then
        print_warning "   Porta $port está em uso"
        echo "      Processo: $(lsof -i :$port 2>/dev/null | grep LISTEN || echo 'N/A')"
    else
        print_success "   Porta $port disponível"
    fi
done
echo ""

# 9. Verificar configuração do docker-compose
print_info "9. Validando docker-compose.prod.yml..."
if docker compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
    print_success "   Configuração válida"
else
    print_error "   Configuração inválida!"
    docker compose -f docker-compose.prod.yml config 2>&1 | tail -10
fi
echo ""

# 10. Verificar recursos do sistema
print_info "10. Recursos do sistema..."
echo "   Memória:"
free -h | grep -E "Mem|Swap" | sed 's/^/      /'
echo "   Disco:"
df -h / | sed 's/^/      /'
echo ""

# 11. Sugestões de troubleshooting
echo "======================================"
print_info "💡 Sugestões de Troubleshooting"
echo "======================================"
echo ""

# Verificar se há containers parados
STOPPED=$(docker compose -f docker-compose.prod.yml ps -a --format json 2>/dev/null | jq -r 'select(.State != "running") | .Name' 2>/dev/null || true)
if [ -n "$STOPPED" ]; then
    print_warning "Containers parados encontrados!"
    echo ""
    echo "   Opções:"
    echo "   1. Ver logs detalhados:"
    for container in $STOPPED; do
        echo "      docker logs --tail=100 $container"
    done
    echo ""
    echo "   2. Tentar reiniciar:"
    echo "      docker compose -f docker-compose.prod.yml up -d"
    echo ""
    echo "   3. Rebuild completo:"
    echo "      docker compose -f docker-compose.prod.yml down"
    echo "      docker compose -f docker-compose.prod.yml build --no-cache"
    echo "      docker compose -f docker-compose.prod.yml up -d"
    echo ""
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    print_error "Arquivo .env não encontrado!"
    echo "   Solução: cp .env.prod .env"
    echo ""
fi

# Verificar rede CodynNet
if ! docker network ls | grep -q "CodynNet"; then
    print_error "Rede CodynNet não existe!"
    echo "   Solução: docker network create CodynNet"
    echo ""
fi

# 12. Comandos úteis
echo "======================================"
print_info "🛠️  Comandos Úteis"
echo "======================================"
echo ""
echo "Ver logs em tempo real:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "Reiniciar um serviço específico:"
echo "  docker compose -f docker-compose.prod.yml restart mcp-api"
echo ""
echo "Reconstruir e reiniciar:"
echo "  docker compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "Parar tudo:"
echo "  docker compose -f docker-compose.prod.yml down"
echo ""
echo "Ver uso de recursos:"
echo "  docker stats"
echo ""
echo "Executar comando dentro do container:"
echo "  docker exec -it mcp-api-prod sh"
echo ""
echo "Verificar health do banco:"
echo "  docker exec pgvector-db-prod pg_isready -U mcpuser -d extrato_db"
echo ""

print_success "Debug completo!"
