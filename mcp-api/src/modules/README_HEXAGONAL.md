# Padrão Hexagonal (Ports & Adapters) para Módulos NestJS

Este projeto adota a arquitetura hexagonal (Ports & Adapters) para garantir alta coesão, baixo acoplamento e facilitar a manutenção e evolução dos módulos.

## Estrutura Recomendada

```
src/modules/<modulo>/
  domain/
    entities/           # (opcional) Entidades de domínio
    services/           # Lógica de negócio pura
    ports/              # Interfaces (ports) para entrada e saída
  application/          # (opcional) Casos de uso, DTOs, regras de aplicação
  infrastructure/
    adapters/
      controllers/      # Controllers REST/GraphQL/etc
      ...               # Outros adaptadores de entrada
    repositories/       # Implementações concretas de repositórios (DB, API, etc)
    ...                 # Outros adaptadores de saída
  <modulo>.module.ts    # Módulo NestJS, faz o binding dos ports/adapters
```

## Exemplo de Ports e Adapters

- **Port (interface):**
  - `UserRepositoryPort` define o contrato para persistência de usuários.
  - `UserServicePort` define o contrato para operações de domínio do usuário.
- **Adapter:**
  - `UserRepository` implementa `UserRepositoryPort` usando Prisma.
  - `UserController` expõe endpoints REST e injeta `UserService`.

## Boas Práticas
- Services e lógica de domínio dependem apenas de ports (interfaces), nunca de implementações concretas.
- Controllers e repositórios são adaptadores, conectando o mundo externo ao domínio.
- Use injeção de dependências do NestJS para mapear interfaces para implementações.
- Tipagem forte: sempre use tipos do Prisma ou DTOs, nunca `any`.
- Testes unitários devem ser feitos sobre ports, usando mocks dos adapters.

## Replicando para outros módulos
1. Crie as pastas `domain`, `application` (opcional) e `infrastructure` no módulo.
2. Defina os ports (interfaces) para repositórios, serviços, integrações, etc.
3. Implemente os adapters (controllers, repositórios, etc) conforme necessário.
4. Ajuste o módulo para fazer o binding dos ports para as implementações.
5. Garanta que a lógica de negócio dependa apenas de ports.

---

Para dúvidas ou sugestões, consulte o time de arquitetura.
