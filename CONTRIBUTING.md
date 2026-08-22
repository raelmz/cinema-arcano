<div align="center">

# 🤝 Contribuindo — Cinema Arcano

*Projeto pessoal (desafio técnico), com um padrão de commits simples para manter o histórico de desenvolvimento legível.*

</div>

---

## Padrão de commits

Formato: `tipo(escopo opcional): descrição no imperativo`

| Tipo | Quando usar |
|---|---|
| `feat` | nova funcionalidade |
| `fix` | correção de bug |
| `docs` | documentação |
| `refactor` | mudança de código sem alterar comportamento |
| `chore` | configuração, dependências, tooling |

Quando fizer sentido, adiciono um escopo entre parênteses: `feat(auth): ...`, `feat(assentos): ...`.

### Exemplos

```
docs: registra contexto do desafio e decisões de arquitetura
feat(auth): implementa login com JWT e RBAC
feat(assentos): adiciona mapa de assentos com bloqueio na reserva
fix(portaria): corrige validação de ingresso já utilizado
chore: configura Docker Compose para ambiente de desenvolvimento
```

> **Regra de ouro:** um commit, uma mudança. Descrição sempre no imperativo ("adiciona", não "adicionado").

---

## Checklist antes de commitar

- [ ] O código roda localmente sem erros (`npm run dev` no pacote alterado)
- [ ] Lint/format passam (`npm run lint`)
- [ ] A mensagem de commit segue o padrão `tipo(escopo): descrição`
- [ ] Mudanças de schema vieram acompanhadas de migration (`npx prisma migrate dev`)
- [ ] Nenhuma variável sensível (chaves de API, segredos) foi commitada

---

## Organização de branches

Como é um projeto solo, o fluxo é simples:

- `main` — sempre em estado deployável
- `feature/<nome>` — para funcionalidades maiores, quando vale isolar o trabalho antes de mergear

---

Dúvidas sobre decisões de arquitetura ou trade-offs específicos: consulte [`docs/PROJETO.md`](./docs/PROJETO.md).
