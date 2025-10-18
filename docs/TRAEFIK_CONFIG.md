# Configuração do Traefik

Este documento descreve como configurar os domínios do Traefik para os serviços do projeto.

## Variáveis de Ambiente

Adicione estas variáveis ao seu arquivo `.env`:

### Para Desenvolvimento (docker-compose.yml)

```env
# Domínios do Traefik - Desenvolvimento
TRAEFIK_API_DOMAIN=api.codyn.site
TRAEFIK_MASTRA_DOMAIN=mastra.codyn.site
```

### Para Produção (docker-compose.prod.yml)

```env
# Domínios do Traefik - Produção
TRAEFIK_DOMAIN=api.mcp.codyn.site
```

## Serviços Configurados

### Docker Compose (Desenvolvimento)

1. **mcp-api** - API NestJS
   - Porta interna: 3333
   - Domínio padrão: `api.codyn.site`
   - Router: `mcp-api-dev`

2. **codyn-mastra** - Mastra AI Service
   - Porta interna: 4111
   - Domínio padrão: `mastra.codyn.site`
   - Router: `codyn-mastra`

3. **db** - PostgreSQL com pgvector
   - Conectado à rede CodynNet para acesso interno
   - Não exposto via Traefik (apenas interno)

### Docker Compose Prod (Produção)

1. **mcp-api** - API NestJS (Produção)
   - Porta interna: 3000
   - Domínio padrão: `api.mcp.codyn.site`
   - Router: `mcp-api`

2. **db** - PostgreSQL com pgvector
   - Apenas na rede interna
   - Não exposto via Traefik

## Labels do Traefik Explicadas

Cada serviço exposto via Traefik possui as seguintes labels:

```yaml
labels:
  - "traefik.enable=true"                                                    # Habilita o Traefik para este container
  - "traefik.http.routers.{service}.rule=Host(`{domain}`)"                  # Define o domínio de acesso
  - "traefik.http.services.{service}.loadbalancer.server.port={port}"       # Porta interna do container
  - "traefik.http.routers.{service}.tls.certresolver=letsencryptresolver"   # Usa Let's Encrypt para SSL
  - "traefik.http.routers.{service}.service={service}"                      # Nome do serviço
  - "traefik.docker.network=CodynNet"                                       # Rede que o Traefik usa
  - "traefik.http.routers.{service}.entrypoints=websecure"                  # Usa HTTPS (porta 443)
  - "traefik.http.routers.{service}.priority=1"                             # Prioridade do roteamento
```

## Redes

### CodynNet (Externa)
- Rede compartilhada entre Traefik, Portainer e os serviços
- Deve ser criada externamente antes de subir os containers
- Já existe na sua VPS

### mcp-network / mcp-network-prod (Interna)
- Rede interna para comunicação entre os serviços
- Criada automaticamente pelo Docker Compose

## Como Usar

### Desenvolvimento

1. Configure as variáveis no `.env`:
```bash
TRAEFIK_API_DOMAIN=api.codyn.site
TRAEFIK_MASTRA_DOMAIN=mastra.codyn.site
```

2. Suba os containers:
```bash
docker-compose up -d
```

3. Acesse:
   - API: https://api.codyn.site
   - Mastra: https://mastra.codyn.site

### Produção

1. Configure as variáveis no `.env`:
```bash
TRAEFIK_DOMAIN=api.mcp.codyn.site
```

2. Suba os containers:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. Acesse:
   - API: https://api.mcp.codyn.site

## DNS

Certifique-se de que os domínios apontam para o IP da sua VPS:

```
api.codyn.site          A    <IP_DA_VPS>
mastra.codyn.site       A    <IP_DA_VPS>
api.mcp.codyn.site      A    <IP_DA_VPS>
```

## Certificados SSL

Os certificados SSL são gerenciados automaticamente pelo Traefik usando Let's Encrypt através do `letsencryptresolver`.

## Troubleshooting

### Container não aparece no Traefik

1. Verifique se o container está na rede CodynNet:
```bash
docker network inspect CodynNet
```

2. Verifique os logs do Traefik:
```bash
docker logs <traefik-container-name>
```

3. Verifique se as labels estão corretas:
```bash
docker inspect <container-name> | grep -A 20 Labels
```

### Erro de SSL

1. Verifique se o DNS está configurado corretamente
2. Aguarde alguns minutos para o Let's Encrypt emitir o certificado
3. Verifique os logs do Traefik para erros de certificado

### Não consegue acessar o serviço

1. Verifique se o container está rodando:
```bash
docker ps
```

2. Teste a conectividade interna:
```bash
docker exec -it <container-name> curl localhost:<port>
```

3. Verifique se a porta configurada está correta nas labels do Traefik