# GitHub Actions Workflows

Este diretório contém os workflows de CI/CD para o projeto MCP.

## 📋 Workflows Disponíveis

### 1. Deploy to Production (`deploy-production.yml`)

**Trigger:** Push para branch `main` ou execução manual

**O que faz:**
- Faz checkout do código
- Configura SSH para acessar a VPS
- Copia os arquivos para a VPS via rsync
- Copia o arquivo `.env.prod` como `.env`
- Executa o build e deploy com Docker Compose
- Realiza health checks dos serviços
- Mostra logs em caso de falha

**Secrets necessários:**
- `SSH_PRIVATE_KEY` - Chave SSH privada para acessar a VPS
- `VPS_HOST` - IP ou domínio da VPS
- `VPS_USER` - Usuário SSH (ex: deploy)

**Variáveis de ambiente:**
- `DEPLOY_PATH` - Caminho de deploy na VPS (padrão: `/home/deploy/mcp`)

### 2. Run Tests (`test.yml`)

**Trigger:** Push para qualquer branch, Pull Requests, ou execução manual

**O que faz:**
- Testa o build da API NestJS
- Testa o build do Codyn Mastra
- Executa testes unitários (se configurados)
- Valida os arquivos docker-compose
- Faz security scan com Trivy
- Testa o build das imagens Docker
- Verifica por secrets hardcoded

**Jobs:**
- `test-api` - Testa o serviço mcp-api
- `test-mastra` - Testa o serviço codyn-mastra
- `docker-build-test` - Testa o build das imagens Docker
- `security-scan` - Faz scan de vulnerabilidades
- `validate-compose` - Valida os arquivos docker-compose
- `summary` - Gera resumo dos testes

## 🚀 Como Usar

### Configurar Secrets no GitHub

1. Vá para **Settings** → **Secrets and variables** → **Actions**
2. Adicione os seguintes secrets:

```
SSH_PRIVATE_KEY
VPS_HOST
VPS_USER
```

### Executar Deploy Manual

1. Vá para **Actions** no GitHub
2. Selecione **Deploy to Production**
3. Clique em **Run workflow**
4. Selecione a branch `main`
5. Clique em **Run workflow**

### Executar Testes Manual

1. Vá para **Actions** no GitHub
2. Selecione **Run Tests**
3. Clique em **Run workflow**
4. Selecione a branch desejada
5. Clique em **Run workflow**

## 📊 Status dos Workflows

Você pode adicionar badges no README principal:

```markdown
![Deploy to Production](https://github.com/seu-usuario/seu-repo/actions/workflows/deploy-production.yml/badge.svg)
![Run Tests](https://github.com/seu-usuario/seu-repo/actions/workflows/test.yml/badge.svg)
```

## 🔒 Segurança

- ✅ Chaves SSH são armazenadas como secrets
- ✅ Arquivos sensíveis são excluídos do rsync
- ✅ Security scan automático com Trivy
- ✅ Verificação de secrets hardcoded
- ✅ Validação de configurações Docker

## 📝 Logs e Debugging

### Ver logs de um workflow

1. Vá para **Actions**
2. Clique no workflow executado
3. Clique no job para ver os logs detalhados

### Logs na VPS

```bash
# Conectar na VPS
ssh deploy@sua-vps.com

# Ver logs dos containers
cd /home/deploy/mcp
docker compose -f docker-compose.prod.yml logs

# Ver logs de um serviço específico
docker compose -f docker-compose.prod.yml logs mcp-api
```

## 🛠️ Troubleshooting

### Deploy falha com "Permission denied"

**Solução:** Verifique se a chave SSH está configurada corretamente:
```bash
# Na VPS
cat /home/deploy/.ssh/authorized_keys
```

### Health check falha

**Solução:** Verifique os logs do container:
```bash
docker compose -f docker-compose.prod.yml logs mcp-api
```

### Network CodynNet not found

**Solução:** Crie a rede na VPS:
```bash
docker network create CodynNet
```

## 📚 Documentação Adicional

- [CICD_SETUP.md](../CICD_SETUP.md) - Guia completo de configuração
- [TRAEFIK_CONFIG.md](../TRAEFIK_CONFIG.md) - Configuração do Traefik
- [scripts/setup-vps.sh](../scripts/setup-vps.sh) - Script de configuração da VPS

## 🔄 Workflow de Desenvolvimento

```
┌─────────────────┐
│  Push to main   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Run Tests     │ ◄── Testes automáticos
└────────┬────────┘
         │
         ▼
    ✅ Tests Pass
         │
         ▼
┌─────────────────┐
│  Build Images   │ ◄── Build Docker
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deploy to VPS  │ ◄── Deploy automático
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Health Checks  │ ◄── Verificação
└────────┬────────┘
         │
         ▼
    ✅ Deploy OK
```

## ⚡ Performance

- **Cache:** npm dependencies são cacheadas
- **Rsync:** Apenas arquivos modificados são copiados
- **Build:** Imagens Docker usam cache quando possível
- **Parallel:** Jobs de teste rodam em paralelo

## 🎯 Próximos Passos

- [ ] Adicionar testes end-to-end
- [ ] Implementar staging environment
- [ ] Adicionar notificações (Slack/Discord)
- [ ] Configurar rollback automático
- [ ] Adicionar métricas de deploy
- [ ] Implementar blue-green deployment