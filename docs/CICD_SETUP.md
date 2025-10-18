# CI/CD Setup - Deploy Automático para Produção

Este documento explica como configurar o pipeline de CI/CD para fazer deploy automático na sua VPS sempre que houver commit na branch `main`.

## 📋 Pré-requisitos

- Repositório no GitHub
- VPS com Docker e Docker Compose instalados
- Acesso SSH à VPS
- Traefik e rede CodynNet já configurados na VPS

## 🔑 Configuração dos Secrets no GitHub

Você precisa adicionar os seguintes secrets no seu repositório do GitHub:

### Como adicionar secrets:
1. Vá para o repositório no GitHub
2. Clique em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**

### Secrets necessários:

#### 1. `SSH_PRIVATE_KEY`
Chave SSH privada para acessar a VPS.

**Como gerar:**
```bash
# Na sua máquina local, gere um par de chaves SSH (se ainda não tiver)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# Copie a chave pública para a VPS
ssh-copy-id -i ~/.ssh/github_deploy.pub user@sua-vps.com

# Copie o conteúdo da chave PRIVADA para o secret
cat ~/.ssh/github_deploy
```

Cole todo o conteúdo (incluindo `-----BEGIN OPENSSH PRIVATE KEY-----` e `-----END OPENSSH PRIVATE KEY-----`) no secret `SSH_PRIVATE_KEY`.

#### 2. `VPS_HOST`
Endereço IP ou domínio da sua VPS.

**Exemplo:**
```
123.456.789.0
```
ou
```
vps.codyn.site
```

#### 3. `VPS_USER`
Usuário SSH para acessar a VPS.

**Exemplo:**
```
deploy
```
ou
```
root
```

## 📁 Estrutura de Deploy

O deploy será feito no seguinte diretório da VPS:
```
/home/deploy/mcp/
```

Se você quiser mudar esse caminho, edite a variável `DEPLOY_PATH` no arquivo `.github/workflows/deploy-production.yml`.

## 🔧 Configuração na VPS

### 1. Criar usuário de deploy (recomendado)

```bash
# Na VPS, como root
adduser deploy
usermod -aG docker deploy

# Configurar permissões para Docker
sudo setfacl -m user:deploy:rw /var/run/docker.sock

# Ou adicionar ao grupo docker
sudo usermod -aG docker deploy
newgrp docker
```

### 2. Criar diretório de deploy

```bash
# Na VPS
mkdir -p /home/deploy/mcp
chown -R deploy:deploy /home/deploy/mcp
```

### 3. Verificar se a rede CodynNet existe

```bash
# Na VPS
docker network ls | grep CodynNet
```

Se não existir, crie:
```bash
docker network create CodynNet
```

## 🚀 Como Funciona o Pipeline

### Trigger
O pipeline é executado automaticamente quando:
- Há um push para a branch `main`
- Executado manualmente via GitHub Actions interface

### Etapas do Pipeline

1. **Checkout code** - Baixa o código do repositório
2. **Setup SSH** - Configura a chave SSH para acessar a VPS
3. **Add VPS to known hosts** - Adiciona a VPS aos hosts conhecidos
4. **Create deployment directory** - Cria o diretório de deploy na VPS
5. **Copy files to VPS** - Copia os arquivos via rsync (excluindo arquivos desnecessários)
6. **Copy production environment file** - Copia o `.env.prod` como `.env`
7. **Deploy with Docker Compose** - Faz o deploy usando docker-compose.prod.yml
   - Pull das imagens
   - Build das imagens
   - Start dos containers
   - Limpeza de imagens antigas
8. **Health Check** - Verifica se os serviços estão rodando corretamente
9. **Show logs on failure** - Mostra logs em caso de falha
10. **Send notification** - Notifica sobre sucesso ou falha

## 📝 Arquivo .env.prod

O arquivo `.env.prod` contém todas as variáveis de ambiente de produção e será copiado como `.env` na VPS durante o deploy.

**⚠️ IMPORTANTE:** 
- Mantenha o `.env.prod` no repositório para o CI/CD funcionar
- Considere usar GitHub Secrets para valores sensíveis (ver seção abaixo)

## 🔒 Segurança Melhorada (Opcional)

Para maior segurança, você pode armazenar variáveis sensíveis como GitHub Secrets:

### 1. Adicionar secrets sensíveis no GitHub

```
POSTGRES_PASSWORD
JWT_SECRET
OPENAI_API_KEY
GITHUB_TOKEN
INTERNAL_API_TOKEN
```

### 2. Modificar o workflow para criar .env dinamicamente

Edite `.github/workflows/deploy-production.yml` e substitua a etapa "Copy production environment file" por:

```yaml
- name: Create production environment file
  run: |
    cat > .env << EOF
    POSTGRES_DB=extrato_db
    POSTGRES_USER=mcpuser
    POSTGRES_PASSWORD=${{ secrets.POSTGRES_PASSWORD }}
    POSTGRES_HOST=db
    POSTGRES_PORT=5432
    NODE_ENV=production
    API_PORT=3333
    JWT_SECRET=${{ secrets.JWT_SECRET }}
    JWT_EXPIRES_IN=7d
    OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}
    GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}
    INTERNAL_API_TOKEN=${{ secrets.INTERNAL_API_TOKEN }}
    CHATBOT_URL=http://codyn-mastra:4111
    TRAEFIK_DOMAIN=api.mcp.codyn.site
    EOF
    scp .env ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }}:${{ env.DEPLOY_PATH }}/.env
```

## 🧪 Testando o Pipeline

### Deploy Manual
Você pode executar o pipeline manualmente:
1. Vá para o repositório no GitHub
2. Clique em **Actions**
3. Selecione **Deploy to Production**
4. Clique em **Run workflow**
5. Selecione a branch `main`
6. Clique em **Run workflow**

### Monitorar Logs
Durante o deploy, você pode acompanhar os logs em tempo real:
- Vá para **Actions** no GitHub
- Clique no workflow em execução
- Clique no job "Deploy to VPS"

## 🔍 Verificação Pós-Deploy

Após o deploy, verifique:

### 1. Status dos containers
```bash
# Na VPS
cd /home/deploy/mcp
docker compose -f docker-compose.prod.yml ps
```

### 2. Logs dos serviços
```bash
# Ver logs de todos os serviços
docker compose -f docker-compose.prod.yml logs

# Ver logs de um serviço específico
docker compose -f docker-compose.prod.yml logs mcp-api
docker compose -f docker-compose.prod.yml logs db
```

### 3. Health checks
```bash
# Verificar banco de dados
docker exec pgvector-db-prod pg_isready -U mcpuser -d extrato_db

# Verificar API
curl -f https://api.mcp.codyn.site/health
```

### 4. Verificar Traefik
```bash
# Ver se o serviço está registrado no Traefik
docker logs <traefik-container-name> | grep mcp-api
```

## 🐛 Troubleshooting

### Erro: Permission denied (publickey)
- Verifique se a chave SSH está correta no secret `SSH_PRIVATE_KEY`
- Verifique se a chave pública está no `~/.ssh/authorized_keys` da VPS

### Erro: Cannot connect to Docker daemon
- Verifique se o usuário tem permissão para usar Docker:
```bash
sudo usermod -aG docker deploy
```

### Containers não iniciam
- Verifique os logs:
```bash
docker compose -f docker-compose.prod.yml logs
```

### Health check falha
- Aguarde mais tempo para os serviços iniciarem
- Verifique se as portas estão corretas
- Verifique as variáveis de ambiente

### Network CodynNet not found
```bash
# Na VPS
docker network create CodynNet
```

## 📊 Monitoramento

### Ver status em tempo real
```bash
# Na VPS
watch docker compose -f docker-compose.prod.yml ps
```

### Ver uso de recursos
```bash
docker stats
```

### Ver logs em tempo real
```bash
docker compose -f docker-compose.prod.yml logs -f
```

## 🔄 Rollback

Se algo der errado, você pode fazer rollback:

```bash
# Na VPS
cd /home/deploy/mcp

# Parar os containers
docker compose -f docker-compose.prod.yml down

# Fazer checkout de um commit anterior (se tiver acesso ao git)
git checkout <commit-hash-anterior>

# Ou restaurar backup dos arquivos
# ...

# Subir os containers novamente
docker compose -f docker-compose.prod.yml up -d
```

## 📈 Melhorias Futuras

- [ ] Adicionar notificações no Slack/Discord
- [ ] Implementar Blue-Green deployment
- [ ] Adicionar testes automatizados antes do deploy
- [ ] Criar backup automático antes do deploy
- [ ] Implementar rollback automático em caso de falha
- [ ] Adicionar métricas e monitoring (Prometheus/Grafana)

## 📚 Recursos Adicionais

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)

## ✅ Checklist de Configuração

Antes de fazer o primeiro deploy, verifique:

- [ ] Secrets configurados no GitHub (SSH_PRIVATE_KEY, VPS_HOST, VPS_USER)
- [ ] Chave SSH configurada na VPS
- [ ] Docker e Docker Compose instalados na VPS
- [ ] Usuário de deploy criado na VPS (opcional mas recomendado)
- [ ] Diretório `/home/deploy/mcp` criado na VPS
- [ ] Rede `CodynNet` existe na VPS
- [ ] Traefik rodando na VPS
- [ ] DNS configurado apontando para a VPS
- [ ] Arquivo `.env.prod` configurado corretamente
- [ ] Workflow testado manualmente

## 🎉 Pronto!

Agora toda vez que você fizer push para a branch `main`, o deploy será feito automaticamente na sua VPS!
