# Projeto AWS Docker - Redes de Computadores

Projeto desenvolvido para a disciplina de Redes de Computadores II da Fatec de Sao Jose dos Campos.

O objetivo principal do projeto nao e a aplicacao em si, mas sim a infraestrutura usada para publica-la em uma instancia Linux na nuvem da AWS. A aplicacao e um sistema financeiro simples, com contas a pagar, contas a receber, centros de custo e dashboard, usado como servico web para validar os conceitos de conteinerizacao, balanceamento de carga e acesso privado por VPN.

## Objetivo do projeto

O projeto foi dividido em duas entregas:

1. **Docker + HAProxy**
   - Aplicacao conteinerizada com Docker.
   - Backend executando em multiplas replicas.
   - HAProxy configurado como load balancer.
   - Aplicacao acessivel livremente via HTTP.
   - SSH restrito ao uso de chave `.pem`.

2. **VPN**
   - Implementacao de uma VPN com WireGuard.
   - Acesso a aplicacao permitido apenas pela VPN.
   - Acesso SSH tambem permitido apenas pela VPN, mantendo a autenticacao por chave `.pem`.

A ordem das entregas nao era obrigatoria. Neste projeto, a primeira etapa implementada foi Docker + HAProxy e, depois, a VPN.

## Tecnologias utilizadas

- **AWS**: ambiente de nuvem usado para hospedar a instancia Linux.
- **Docker**: conteinerizacao dos servicos da aplicacao.
- **Docker Compose**: orquestracao dos containers.
- **HAProxy**: balanceador de carga HTTP.
- **WireGuard**: VPN para acesso privado a instancia.
- **PostgreSQL**: banco de dados relacional.
- **Flask + Gunicorn**: backend da aplicacao.
- **React + Vite + Nginx**: frontend da aplicacao.

## Arquitetura

```text
Cliente conectado na VPN
        |
        | HTTP / SSH
        v
Instancia Linux na AWS
        |
        +-- WireGuard
        |     Rede VPN: 10.13.13.0/24
        |     Gateway: 10.13.13.1
        |
        +-- HAProxy :80
        |     |
        |     +-- /api e /health -> backend1/backend2/backend3
        |     +-- demais rotas  -> frontend
        |
        +-- Frontend React servido por Nginx
        |
        +-- Backends Flask
        |     +-- backend1:5000
        |     +-- backend2:5000
        |     +-- backend3:5000
        |
        +-- PostgreSQL
```

## Como o Docker e usado

O Docker foi usado para empacotar cada parte da aplicacao em containers independentes. Isso facilita a execucao na nuvem porque a instancia Linux precisa apenas ter Docker e Docker Compose instalados.

O arquivo `docker-compose.yml` define os seguintes servicos:

- `wireguard`: servidor VPN.
- `db`: banco PostgreSQL.
- `backend1`, `backend2` e `backend3`: tres instancias iguais do backend Flask.
- `frontend`: aplicacao React compilada e servida por Nginx.
- `haproxy`: ponto de entrada HTTP e balanceador de carga.

Com isso, a infraestrutura inteira sobe com um unico comando:

```bash
docker compose up -d --build
```

## Load balance com HAProxy

O HAProxy fica responsavel por receber as requisicoes HTTP na porta 80 e decidir para qual container encaminhar cada requisicao.

A configuracao esta em `haproxy/haproxy.cfg`.

Regras principais:

- Requisicoes para `/api` sao enviadas para os backends Flask.
- Requisicoes para `/health` tambem sao enviadas para os backends.
- Demais rotas sao enviadas para o frontend.
- O balanceamento entre `backend1`, `backend2` e `backend3` usa o algoritmo `roundrobin`.

O `roundrobin` distribui as requisicoes de forma alternada entre as tres instancias do backend, demonstrando o conceito de balanceamento de carga. O HAProxy tambem faz health check em `/health`, usando apenas os backends que estiverem respondendo corretamente.

## VPN e acesso restrito

Na entrega final, o acesso a aplicacao e ao SSH passa a ser exclusivo pela VPN.

O projeto usa o container `lscr.io/linuxserver/wireguard`, configurado no `docker-compose.yml`. O WireGuard cria uma rede privada, definida no `.env.example` como:

```env
WG_INTERNAL_SUBNET=10.13.13.0
VPN_GATEWAY_IP=10.13.13.1
```

O HAProxy publica a aplicacao somente no IP da VPN:

```yaml
ports:
  - "${VPN_GATEWAY_IP}:80:80"
```

Com essa configuracao, a aplicacao nao fica exposta diretamente no IP publico da instancia. O usuario precisa primeiro conectar na VPN e depois acessar:

```text
http://10.13.13.1
```

O mesmo conceito vale para o SSH. Na primeira entrega, o SSH era protegido pela chave `.pem`. Na segunda entrega, alem da chave `.pem`, o SSH deve ser acessado pelo endereco interno da VPN:

```bash
ssh -i sua-chave.pem usuario@10.13.13.1
```

A restricao de portas publicas da instancia, como liberar ou bloquear HTTP, SSH e UDP 51820, deve ser feita nas regras da nuvem. Este repositorio documenta a instalacao e execucao do projeto em uma instancia Linux ja criada.

## Aplicacao

A aplicacao e um sistema financeiro simples, usado principalmente para validar a infraestrutura.

Funcionalidades principais:

- Cadastro de centros de custo.
- Cadastro de contas a pagar e a receber.
- Marcacao de transacoes como pagas.
- Suporte a transacoes recorrentes.
- Dashboard com totais e saldo.

Rotas principais do backend:

- `GET /health`
- `GET /api/dashboard`
- `GET /api/transactions`
- `POST /api/transactions`
- `POST /api/transactions/<id>/pay`
- `GET /api/cost-centers`
- `POST /api/cost-centers`

## Como rodar em uma nuvem Linux

Estas instrucoes consideram que a instancia Linux na nuvem ja foi criada e que voce ja consegue acessa-la por SSH. A criacao da instancia, configuracao de rede, security groups, firewall e chave `.pem` sao responsabilidade de quem for clonar e testar o projeto.

### 1. Acessar a instancia

```bash
ssh -i sua-chave.pem usuario@IP_PUBLICO_DA_INSTANCIA
```

### 2. Instalar dependencias

Em uma distribuicao baseada em Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y git docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
```

Opcionalmente, adicione seu usuario ao grupo do Docker:

```bash
sudo usermod -aG docker $USER
```

Depois disso, saia e entre novamente na sessao SSH.

### 3. Clonar o projeto

```bash
git clone URL_DO_REPOSITORIO
cd Projeto-AWS-Docker
```

### 4. Criar o arquivo `.env`

```bash
cp .env.example .env
nano .env
```

Edite os valores conforme a sua instancia:

```env
PUID=1000
PGID=1000
TZ=America/Sao_Paulo

WG_SERVERURL=SEU_IP_PUBLICO_OU_DNS
WG_SERVERPORT=51820
WG_PEERS=3
WG_PEERDNS=1.1.1.1
WG_INTERNAL_SUBNET=10.13.13.0
WG_ALLOWEDIPS=10.13.13.0/24

VPN_GATEWAY_IP=10.13.13.1

POSTGRES_USER=admin
POSTGRES_PASSWORD=troque_essa_senha
POSTGRES_DB=finances_db
POSTGRES_PORT=5432
```

Para a entrega final com VPN, mantenha:

```env
VPN_GATEWAY_IP=10.13.13.1
```

Para reproduzir a primeira entrega, com HTTP livre sem VPN, use:

```env
VPN_GATEWAY_IP=0.0.0.0
```

Nesse modo, a aplicacao ficara disponivel pela porta 80 do IP publico da instancia, desde que a nuvem permita esse trafego.

### 5. Subir os containers

```bash
docker compose up -d --build
```

Verifique se os containers estao rodando:

```bash
docker compose ps
```

Verifique os logs se necessario:

```bash
docker compose logs -f
```

### 6. Obter os arquivos de configuracao da VPN

Apos subir o WireGuard, os arquivos dos peers sao gerados dentro da pasta `config`.

Exemplo:

```bash
ls config
```

Normalmente os arquivos ficam em pastas como:

```text
config/peer1/peer1.conf
config/peer2/peer2.conf
config/peer3/peer3.conf
```

Copie o arquivo `.conf` desejado para o cliente WireGuard do computador que vai acessar a aplicacao.

### 7. Acessar a aplicacao pela VPN

Com a VPN conectada, acesse:

```text
http://10.13.13.1
```

Para testar o health check do backend:

```text
http://10.13.13.1/health
```

Como existem tres backends balanceados pelo HAProxy, a resposta de `/health` pode alternar entre diferentes containers.

### 8. Acessar SSH pela VPN

Com a VPN conectada:

```bash
ssh -i sua-chave.pem usuario@10.13.13.1
```

Assim, mesmo o SSH continua usando autenticacao por chave, mas o acesso passa a depender tambem da conexao VPN.

## Comandos uteis

Parar os containers:

```bash
docker compose down
```

Subir novamente:

```bash
docker compose up -d
```

Rebuildar apos alteracoes:

```bash
docker compose up -d --build
```

Ver logs do HAProxy:

```bash
docker compose logs -f haproxy
```

Ver logs dos backends:

```bash
docker compose logs -f backend1 backend2 backend3
```

Ver logs da VPN:

```bash
docker compose logs -f wireguard
```

## Estrutura do projeto

```text
.
+-- backend/
|   +-- app.py
|   +-- routes.py
|   +-- models.py
|   +-- services.py
|   +-- requirements.txt
|   +-- Dockerfile
+-- frontend/
|   +-- src/
|   +-- package.json
|   +-- vite.config.js
|   +-- Dockerfile
+-- haproxy/
|   +-- haproxy.cfg
+-- docker-compose.yml
+-- .env.example
+-- README.md
```

## Consideracoes finais

Este projeto demonstra uma arquitetura simples, mas muito comum em ambientes reais:

- Servicos separados em containers.
- Banco de dados isolado.
- Multiplas replicas do backend.
- Balanceamento de carga com HAProxy.
- Ponto unico de entrada HTTP.
- Acesso administrativo por SSH com chave.
- Acesso privado por VPN para reduzir exposicao publica.

Mesmo com uma aplicacao generica, a infraestrutura atende aos principais requisitos da atividade de Redes de Computadores II: conteinerizacao, load balance, publicacao em nuvem, acesso seguro por chave e isolamento de acesso por VPN.
