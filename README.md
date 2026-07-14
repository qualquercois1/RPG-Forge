# Forja — Gerenciador de Personagens RPG 🛡️⚔️

Bem-vindo ao **Forja**, uma aplicação web cyber-fantasy para gerenciamento de fichas de personagens de RPG, diários de campanhas, rolagem de dados e controle de inventário por parte dos jogadores e do Mestre (GM).

Este projeto é dividido em duas partes principais:
1. **Backend:** Desenvolvido em **Python** utilizando **FastAPI** e banco de dados **SQLite**.
2. **Frontend:** Desenvolvido em **React**, **Vite**, **TypeScript** e **TanStack Router**.

---

## 🚀 Como Executar o Projeto Localmente

### 1. Backend (FastAPI)

1. Certifique-se de ter o **Python 3.10+** instalado.
2. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```
3. Instale as dependências necessárias:
   ```bash
   pip install fastapi uvicorn pydantic bcrypt
   ```
4. Execute o servidor de desenvolvimento:
   ```bash
   uvicorn main:app --reload
   ```
   * O backend estará disponível por padrão em: [http://localhost:8000](http://localhost:8000)
   * O banco de dados SQLite (`rpg.db`) será criado automaticamente no diretório raiz do projeto ao rodar o servidor pela primeira vez.

---

### 2. Frontend (React + Vite)

1. Certifique-se de ter o **Node.js (LTS)** instalado.
2. Navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```
3. Instale as dependências do projeto:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento do Vite:
   ```bash
   npm run dev
   ```
   * O frontend estará disponível por padrão em: [http://localhost:5173](http://localhost:5173)

---

## 🌐 Como Acessar pela Mesma Rede Local (LAN)

Se você deseja acessar a aplicação de outros dispositivos na mesma rede (como um celular, tablet ou outro computador), siga as instruções abaixo:

### Passo 1: Descobrir o IP Local do Computador (Hospedeiro)

No computador que está rodando a aplicação (servidor):
* **Windows (PowerShell/CMD):** Execute `ipconfig` e procure pelo endereço `IPv4` (ex: `192.168.1.15`).
* **Linux/macOS:** Execute `ifconfig` ou `ip a` (ex: `192.168.1.15`).

---

### Passo 2: Configurar e Rodar o Backend para a Rede

Por padrão, o servidor local do FastAPI escuta apenas conexões locais (`127.0.0.1`). Para abrir para a rede, adicione a flag `--host 0.0.0.0`:

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

### Passo 3: Configurar a API no Frontend

Por padrão, o frontend está configurado para enviar requisições para `localhost:8000`. Dispositivos externos (como celulares) não conseguirão se comunicar se o endereço for `localhost` (eles buscarão o backend neles mesmos).

1. Abra o arquivo [frontend/src/context/character-context.tsx](file:///C:/Users/cassio.santos/Documents/Python/RPGv2/frontend/src/context/character-context.tsx).
2. Localize a linha de declaração do `API_BASE`:
   ```typescript
   export const API_BASE = "http://localhost:8000/api";
   ```
3. Altere o endereço para usar o seu IP Local descoberto no **Passo 1**:
   ```typescript
   export const API_BASE = "http://<SEU_IP_LOCAL>:8000/api";
   // Exemplo: export const API_BASE = "http://192.168.1.15:8000/api";
   ```

---

### Passo 4: Executar o Frontend para a Rede

Inicie o Vite configurando-o para expor o servidor de desenvolvimento para a rede local:

```bash
cd frontend
npm run dev -- --host
```

Após rodar o comando, o terminal do Vite mostrará o link de acesso na rede (ex: `http://192.168.1.15:5173`). 

Abra esse link no navegador do seu smartphone ou de qualquer dispositivo conectado ao mesmo Wi-Fi para jogar em tempo real com seu grupo! 🎲
