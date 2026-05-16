# Configuração do MySQL

## 1. Criar banco e tabelas

Execute o arquivo `database/schema.sql` no MySQL da hospedagem ou no phpMyAdmin.

Ele cria:

- `users`
- `transactions`
- `financial_goals`
- `category_budgets`
- `recurring_transactions`
- `credit_cards`
- `shared_accesses`
- `receipts`
- `receipt_items`

## 2. Configurar variáveis

Copie `.env.example` para `.env` e preencha os dados do MySQL:

```env
PORT=3333
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=financeapp
JWT_SECRET=troque_por_uma_chave_segura
VITE_API_URL=https://luisaugusto.eng.br/financeiro/api/index.php
```

Não envie o arquivo `.env` para a hospedagem pública ou repositório.

## 3. Rodar API localmente

```bash
npm run dev:api
```

Em produção, se o site e a API PHP estiverem no mesmo domínio/servidor, use:

```env
DB_HOST=localhost
VITE_API_URL=https://luisaugusto.eng.br/financeiro/api/index.php
```

O `DB_HOST=localhost` é importante porque a API estará rodando dentro da própria hospedagem, no mesmo servidor do MySQL.

Teste a conexão:

```text
http://localhost:3333/api/health
```

Se estiver correto, a resposta será parecida com:

```json
{
  "status": "ok",
  "database": "connected"
}
```

## Erro de acesso remoto ao MySQL

Se aparecer uma mensagem parecida com:

```text
Host 'SEU_IP' is not allowed to connect to this MariaDB server
```

o banco está bloqueando conexões externas. Nesse caso, existem duas opções:

- liberar o IP informado na área de **Remote MySQL** da hospedagem/cPanel;
- ou subir a API Node na mesma hospedagem/servidor do MySQL e usar `DB_HOST=localhost`.

## 4. Rodar o painel

Em outro terminal:

```bash
npm run dev
```

O frontend atual continua funcionando com `localStorage`. A API MySQL já está pronta para a próxima etapa: trocar os contextos do painel para buscar e salvar dados no backend.

## 5. Erro "Failed to fetch" no cadastro

Esse erro normalmente acontece quando o frontend tenta chamar `localhost`.

No navegador do usuário, `localhost` é o computador do usuário, não a hospedagem. Por isso, no build enviado para a hospedagem, `VITE_API_URL` precisa apontar para a API pública. Para hospedagem com PHP no mesmo domínio, use:

```env
VITE_API_URL=https://luisaugusto.eng.br/financeiro/api/index.php
```

Depois de alterar essa variável, gere um novo build e envie a pasta `dist` novamente para a hospedagem.

## 6. API PHP para hospedagem comum

Se a hospedagem não liberar Node.js/porta `3333`, use a API PHP que já está em `public/api`.

Ao rodar `npm run build`, a pasta `public/api` é copiada para `dist/api`. Envie a pasta `dist` inteira para a hospedagem, incluindo:

- `dist/api/index.php`
- `dist/api/config.php`
- `dist/api/.htaccess`

Assim o cadastro e login funcionam chamando `api/index.php/auth/register` e `api/index.php/auth/login` no próprio domínio do site, sem depender de porta Node e sem depender do `.htaccess`.
