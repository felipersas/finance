# 🚀 Guia Rápido - Deploy Automático

Este guia vai te ajudar a configurar o deploy automático em **menos de 10 minutos**.

## ✅ Pré-requisitos

- [ ] Repositório no GitHub
- [ ] VPS com acesso SSH
- [ ] Docker e Docker Compose instalados na VPS
- [ ] Traefik rodando na VPS

## 📝 Passo 1: Configurar a VPS

### Opção A: Script Automático (Recomendado)

```bash
# Na VPS, execute como root:
wget https://raw.githubusercontent.com/seu-usuario/seu-repo/main/scripts/setup-vps.sh
chmod +x setup-vps.sh
sudo ./setup-vps.sh
```

### Opção B: Manual

```bash
# Na VPS, execute:
# 1. Criar usuário de deploy
sudo adduser deploy
sudo usermod -aG docker deploy

# 2. Criar diretório
sudo mkdir -p /home/deploy/mcp
sudo chown -R deploy:deploy /home/deploy/mcp

# 3. Criar rede Docker
docker network create CodynNet

# 4. Configurar permissões
sudo setfacl -m user:deploy:rw /var/run/docker.sock
```

## 🔑 Passo 2: Configurar SSH

### Na sua máquina local:

```bash
# 1. Gerar chave SSH (se não tiver)
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy

# 2. Copiar chave pública para VPS
ssh-copy-id -i ~/.ssh/github_deploy.pub deploy@SEU_VPS_IP

# 3. Testar conexão
ssh -i ~/.ssh/github_deploy deploy@SEU_VPS_IP

# 4. Copiar chave PRIVADA (para GitHub Secrets)
cat ~/.ssh/github_deploy
# Copie TODO o conteúdo (incluindo BEGIN e END)
```

## 🔐 Passo 3: Configurar GitHub Secrets

1. Vá para seu repositório no GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione os 3 secrets:

### Secret 1: SSH_PRIVATE_KEY
```
-----BEGIN OPENSSH PRIVATE KEY-----
(cole aqui o conteúdo da chave privada)
-----END OPENSSH PRIVATE KEY-----
```

### Secret 2: VPS_HOST
```
123.456.789.0
```
(ou seu domínio: vps.codyn.site)

### Secret 3: VPS_USER
```
deploy
```

## 📂 Passo 4: Verificar Arquivos

Certifique-se que seu repositório tem estes arquivos:

```
✅ .github/workflows/deploy-production.yml
✅ docker-compose.prod.yml
✅ .env.prod
✅ mcp-api/Dockerfile
```

## 🎯 Passo 5: Fazer o Deploy

### Opção A: Push para main

```bash
git add .
git commit -m "feat: configurar CI/CD"
git push origin main
```

O deploy vai iniciar automaticamente! 🎉

### Opção B: Deploy Manual

1. Vá para **Actions** no GitHub
2. Selecione **Deploy to Production**
3. Clique em **Run workflow**
4. Selecione branch `main`
5. Clique em **Run workflow**

## 👀 Passo 6: Acompanhar o Deploy

1. Vá para **Actions** no GitHub
2. Clique no workflow em execução
3. Acompanhe o progresso em tempo real

## ✅ Verificar se Funcionou

### No GitHub:
- Workflow deve ter status ✅ verde
- Última etapa deve mostrar "Deployment completed successfully"

### Na VPS:
```bash
ssh deploy@SEU_VPS_IP
cd /home/deploy/mcp
docker compose -f docker-compose.prod.yml ps
```

Deve mostrar containers rodando:
```
✅ pgvector-db-prod    Up
✅ mcp-api-prod        Up
```

### No Navegador:
Acesse: https://api.mcp.codyn.site/health

Deve retornar: `{"status":"ok"}`

## 🎉 Pronto!

Agora toda vez que você fizer push para `main`, o deploy é automático!

---

## 🐛 Problemas Comuns

### ❌ "Permission denied (publickey)"

**Solução:**
```bash
# Verifique se a chave está na VPS
ssh deploy@SEU_VPS_IP "cat ~/.ssh/authorized_keys"

# Se não estiver, adicione novamente
ssh-copy-id -i ~/.ssh/github_deploy.pub deploy@SEU_VPS_IP
```

### ❌ "Cannot connect to Docker daemon"

**Solução:**
```bash
# Na VPS
sudo usermod -aG docker deploy
sudo setfacl -m user:deploy:rw /var/run/docker.sock

# Teste
ssh deploy@SEU_VPS_IP "docker ps"
```

### ❌ "Network CodynNet not found"

**Solução:**
```bash
# Na VPS
docker network create CodynNet
```

### ❌ Health check failed

**Solução:**
```bash
# Na VPS, veja os logs
cd /home/deploy/mcp
docker compose -f docker-compose.prod.yml logs mcp-api
```

---

## 📚 Próximos Passos

- [ ] Configurar DNS apontando para a VPS
- [ ] Adicionar monitoramento (Opcional)
- [ ] Configurar backups automáticos (Opcional)
- [ ] Ler documentação completa em [CICD_SETUP.md](./CICD_SETUP.md)

---

## 🆘 Precisa de Ajuda?

1. Veja os logs no GitHub Actions
2. Veja os logs na VPS: `docker compose -f docker-compose.prod.yml logs`
3. Consulte [CICD_SETUP.md](./CICD_SETUP.md) para troubleshooting detalhado

---

## 🔄 Workflow Resumido

```
📝 Commit → 🔄 Push → 🚀 GitHub Actions → 📦 Build → 🌐 Deploy → ✅ Health Check
```

**Tempo total:** ~3-5 minutos por deploy

---

## 📊 Checklist Final

Antes do primeiro deploy, verifique:

- [ ] SSH_PRIVATE_KEY configurado no GitHub
- [ ] VPS_HOST configurado no GitHub
- [ ] VPS_USER configurado no GitHub
- [ ] Usuário `deploy` existe na VPS
- [ ] Usuário `deploy` está no grupo docker
- [ ] Diretório `/home/deploy/mcp` existe
- [ ] Rede `CodynNet` existe
- [ ] Traefik está rodando
- [ ] DNS aponta para a VPS
- [ ] Arquivo `.env.prod` está configurado

---

**Tudo pronto? Faça seu primeiro deploy! 🚀**

```bash
git add .
git commit -m "🚀 Initial deployment setup"
git push origin main
```
