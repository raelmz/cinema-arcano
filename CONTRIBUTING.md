# Contribuindo

Este é um projeto pessoal (desafio técnico), mas mantenho um padrão de commits simples para deixar o histórico de desenvolvimento legível.

## Padrão de commits

Formato: `tipo: descrição no imperativo`

Tipos usados neste projeto:

- **feat** — nova funcionalidade
- **fix** — correção de bug
- **docs** — documentação
- **refactor** — mudança de código sem alterar comportamento
- **chore** — configuração, dependências, tooling

Quando fizer sentido, adiciono um escopo entre parênteses: `feat(auth): ...`, `feat(assentos): ...`.

**Exemplos:**
```
docs: registra contexto do desafio e decisões de arquitetura
feat(auth): implementa login com JWT e RBAC
feat(assentos): adiciona mapa de assentos com bloqueio na reserva
fix(portaria): corrige validação de ingresso já utilizado
chore: configura Docker Compose para ambiente de desenvolvimento
```

Um commit, uma mudança. Descrição sempre no imperativo ("adiciona", não "adicionado").
