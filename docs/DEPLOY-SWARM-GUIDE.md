# Guia Completo: Deploy com Docker Swarm e Variáveis de Ambiente

Este guia explica como fazer deploy da aplicação usando Docker Swarm, com foco especial em como lidar com variáveis de ambiente.

## 🎯 Problema Resolvido

**Descoberta importante:** Docker Swarm **NÃO** carrega automaticamente o arquivo `.env` como o `docker compose` faz. As variáveis de ambiente precisam ser exportadas explicitamente antes do deploy.

### Sintomas do Problema

- Containers ficam em loop infinito aguardando conexão com o banco
- Mensagens como "Waiting for database DNS resolution..." indefinidamente
- Banco de dados não inicia por falta de `POSTGRES_PASSWORD`
- Serviços não conseguem se comunicar

### Causa Raiz

No Docker Compose tradicional:
```bash
docker compose up  # ✅ Lê .env automaticamente
```

No Docker Swarm:
```bash
docker stack deploy -c docker-compose.yml mcp  # ❌ NÃO lê .env
```

## ✅ Solução: Exportar Variáveis Antes do Deploy

A solução correta é carregar as variáveis de ambiente antes de fazer o deploy:

```bash
bash -c 'set -a && source .env && set +a && docker stack deploy -c docker-compose.prod.yml mcp'
```

### O que cada comando faz:

- `set -a` - Marca todas as variáveis para serem exportadas automaticamente
- `source .env` - Carrega as variáveis do arquivo .env
- `set +a` - Desativa a exportação automática
- `docker stack deploy` - Faz o deploy com as variáveis já carregadas no ambiente

## 🚀 Deploy Rápido (Método Recomendado)

### Opção 1: Script Automatizado

```bash
./deploy-swarm.sh
```

Este script faz tudo automaticamente:
- ✅ Inicializa o Swarm (se necessário)
- ✅ Cria a rede CodynNet
- ✅ Builda as imagens de produção
- ✅ Carrega as variáveis do .env
- ✅ Faz o deploy da stack
- ✅ Mostra o status dos serviços

### Opção 2: Comandos Manuais

```bash
# 1. Garantir que Swarm está ativo
docker swarm init

# 2. Criar rede externa
docker network create --driver=overlay --attachable CodynNet

# 3. Buildar imagens
cd codyn-mastra && docker build -t mcp-codyn-mastra:latest --target production . && cd ..
cd mcp-api && docker build -t mcp-mcp-api:latest --target production . && cd ..

# 4. Deploy com variáveis carregadas
bash -c 'set -a && source .env && set +a && docker stack deploy -c docker-compose.prod.yml mcp'

# 5. Monitorar
docker service ls
docker service logs -f mcp_mcp-api
```

## 📝 Estrutura do .env

Seu arquivo `.env` deve conter todas as variáveis necessárias:

```env
# Database
POSTGRES_DB=extrato_db
POSTGRES_USER=mcpuser
POSTGRES_PASSWORD=sua_senha_forte_aqui

# API
NODE_ENV=production
PORT=3000
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRES_IN=7d
INTERNAL_API_TOKEN=seu_token_interno

# Mastra
OPENAI_API_KEY=sua_chave_openai
GITHUB_TOKEN=seu_token_github

# Traefik
TRAEFIK_DOMAIN=api.codyn.site
TRAEFIK_MASTRA_DOMAIN=mastra.codyn.site
```

## 🔍 Correções Implementadas

### 1. Entrypoints Atualizados

Os entrypoints agora verificam o DNS antes de tentar conectar:

**Antes:**
```bash
until nc -z db 5432; do
  sleep 2
done
```

**Depois:**
```bash
# Primeiro verifica DNS
until getent hosts db > /dev/null 2>&1; do
  echo "Waiting for database DNS resolution..."
  sleep 2
done

echo "✅ Database DNS resolved!"

# Depois verifica conexão
until nc -z db 5432 > /dev/null 2>&1; do
  echo "Waiting for database connection..."
  sleep 2
done

echo "✅ Database is ready!"
```

Isso resolve o problema de DNS lento no Swarm (pode levar 5-15 segundos para propagar).

### 2. Healthchecks Corrigidos

**mcp-api:**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/"]  # Mudou de /health para /
  timeout: 10s
  retries: 5
  interval: 30s
  start_period: 60s
```

### 3. Redes Configuradas

Todos os serviços estão conectados a:
- `CodynNet` - Rede externa para Traefik
- `internal-net` - Rede interna overlay para comunicação entre serviços

```yaml
networks:
  CodynNet:
    external: true
  internal-net:
    driver: overlay
    attachable: true
```

## 🔄 Atualizando a Stack

### Update Completo (Rebuild)

```bash
# 1. Remover stack antiga
docker stack rm mcp

# 2. Aguardar remoção
sleep 10

# 3. Rebuildar imagens
cd codyn-mastra && docker build -t mcp-codyn-mastra:latest --target production . && cd ..
cd mcp-api && docker build -t mcp-mcp-api:latest --target production . && cd ..

# 4. Deploy novamente
bash -c 'set -a && source .env && set +a && docker stack deploy -c docker-compose.prod.yml mcp'
```

### Update Rápido (Sem Rebuild)

Se você só mudou configurações no .env ou docker-compose.prod.yml:

```bash
bash -c 'set -a && source .env && set +a && docker stack deploy -c docker-compose.prod.yml mcp'
```

O Swarm detecta as mudanças e atualiza apenas o necessário.

### Update de um Serviço Específico

```bash
# Forçar restart de um serviço
docker service update --force mcp_mcp-api

# Update com nova imagem
docker service update --image mcp-mcp-api:latest mcp_mcp-api
```

## 📊 Monitoramento

### Ver Status dos Serviços

```bash
# Lista todos os serviços
docker service ls

# Saída esperada:
# ID             NAME               MODE         REPLICAS   IMAGE
# xxx            mcp_db             replicated   1/1        pgvector/pgvector:0.8.1-pg14-trixie
# xxx            mcp_codyn-mastra   replicated   1/1        mcp-codyn-mastra:latest
# xxx            mcp_mcp-api        replicated   1/1        mcp-mcp-api:latest
```

### Ver Logs em Tempo Real

```bash
# Logs do banco
docker service logs -f mcp_db

# Logs da API
docker service logs -f mcp_mcp-api

# Logs do Mastra
docker service logs -f mcp_codyn-mastra

# Todos juntos
docker service logs -f mcp_db mcp_mcp-api mcp_codyn-mastra
```

### Verificar Redes

```bash
# Ver containers na rede CodynNet
docker network inspect CodynNet --format '{{range .Containers}}{{.Name}} {{end}}'

# Deve mostrar algo como:
# mcp_mcp-api.1.xxx mcp_db.1.xxx mcp_codyn-mastra.1.xxx
```

### Detalhes de um Serviço

```bash
# Ver tasks/containers de um serviço
docker service ps mcp_mcp-api

# Ver configuração completa
docker service inspect mcp_mcp-api --pretty
```

## 🐛 Troubleshooting

### Problema: "Waiting for database DNS resolution" infinito

**Causa:** DNS do Swarm ainda não propagou o nome `db`

**Solução:**
```bash
# Verificar se o serviço DB está rodando
docker service ps mcp_db

# Ver logs do serviço com problema
docker service logs mcp_mcp-api --tail 50

# Se necessário, remover e redeployar
docker stack rm mcp
sleep 10
bash -c 'set -a && source .env && set +a && docker stack deploy -c docker-compose.prod.yml mcp'
```

### Problema: Serviço em 0/1 (não sobe)

**Causa:** Erro na imagem ou variáveis de ambiente faltando

**Solução:**
```bash
# Ver detalhes do erro
docker service ps mcp_mcp-api --no-trunc

# Ver logs
docker service logs mcp_mcp-api --tail 100

# Verificar se variáveis foram carregadas
docker service inspect mcp_db --format '{{.Spec.TaskTemplate.ContainerSpec.Env}}'
```

### Problema: "POSTGRES_PASSWORD not specified"

**Causa:** Variáveis de ambiente não foram exportadas antes do deploy

**Solução:**
```bash
# Remover stack
docker stack rm mcp
sleep 10

# Deployar COM as variáveis carregadas
bash -c 'set -a && source .env && set +a && docker stack deploy -c docker-compose.prod.yml mcp'
```

### Problema: Healthcheck falhando

**Verificar se o endpoint existe:**
```bash
# Pegar ID do container
CONTAINER_ID=$(docker ps -q -f "name=mcp_mcp-api")

# Testar endpoint manualmente
docker exec $CONTAINER_ID curl -v http://localhost:3000/

# Ver logs do healthcheck
docker service ps mcp_mcp-api
```

### Problema: Serviços não estão na rede CodynNet

**Causa:** Rede foi criada como bridge ao invés de overlay

**Solução:**
```bash
# Ver tipo da rede
docker network inspect CodynNet --format '{{.Driver}}'

# Se for bridge, remover e recriar como overlay
docker network rm CodynNet
docker network create --driver=overlay --attachable CodynNet

# Redeployar
bash -c 'set -a && source .env && set +a && docker stack deploy -c docker-compose.prod.yml mcp'
```

## 🎯 GitHub Actions / CI/CD

O workflow foi atualizado para usar o método correto:

```yaml
- name: Deploy with Swarm
  run: |
    ssh ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} << 'ENDSSH'
      cd ${{ env.DEPLOY_PATH }}

      # Build images
      cd codyn-mastra
      docker build -t mcp-codyn-mastra:latest --target production .
      cd ..

      cd mcp-api
      docker build -t mcp-mcp-api:latest --target production .
      cd ..

      # Deploy com variáveis do .env
      bash -c 'set -a && source .env && set +a && docker stack deploy -c docker-compose.prod.yml mcp'
    ENDSSH
```

**Importante:** O arquivo `.env` precisa existir no servidor!

## 📋 Checklist de Deploy

- [ ] Arquivo `.env` existe e está preenchido
- [ ] Docker Swarm está inicializado (`docker swarm init`)
- [ ] Rede `CodynNet` existe como overlay (`docker network ls`)
- [ ] Imagens foram buildadas com `--target production`
- [ ] Deploy foi feito com `bash -c 'set -a && source .env && set +a && docker stack deploy...'`
- [ ] Serviços estão em 1/1 (`docker service ls`)
- [ ] Todos os serviços estão na rede CodynNet
- [ ] Logs não mostram erros críticos

## 🎉 Resultado Final

Quando tudo estiver funcionando corretamente:

```bash
$ docker service ls
ID             NAME               MODE         REPLICAS   IMAGE
xxx            mcp_db             replicated   1/1        pgvector/pgvector:0.8.1-pg14-trixie
xxx            mcp_codyn-mastra   replicated   1/1        mcp-codyn-mastra:latest
xxx            mcp_mcp-api        replicated   1/1        mcp-mcp-api:latest

$ docker network inspect CodynNet --format '{{range .Containers}}{{.Name}} {{end}}'
mcp_mcp-api.1.xxx mcp_db.1.xxx mcp_codyn-mastra.1.xxx CodynNet-endpoint

$ docker service logs mcp_mcp-api --tail 10
🚀 Starting MCP API V2...
⏳ Waiting for database...
✅ Database DNS resolved!
✅ Database is ready!
📦 Generating Prisma Client...
🔄 Running database migrations...
✅ Migrations completed!
🎯 Starting NestJS application...
[Nest] 1  - LOG [NestFactory] Starting Nest application...
[Nest] 1  - LOG [NestApplication] Nest application successfully started
```

## 🔗 Links Úteis

- [Docker Swarm Documentation](https://docs.docker.com/engine/swarm/)
- [Docker Stack Deploy](https://docs.docker.com/engine/reference/commandline/stack_deploy/)
- [Overlay Networks](https://docs.docker.com/network/overlay/)
- [Environment Variables in Swarm](https://docs.docker.com/compose/environment-variables/)

## 📝 Notas Importantes

1. **Docker Swarm vs Docker Compose:** Swarm não lê `.env` automaticamente!
2. **DNS no Swarm:** Pode levar 5-15 segundos para resolver (normal)
3. **Imagens locais:** Warnings sobre "could not be accessed on a registry" são normais
4. **Healthchecks:** São críticos no Swarm, certifique-se que os endpoints existem
5. **Redes overlay:** Use `attachable: true` para melhor resolução de DNS
