# API de teste Senior
Esta API foi construída para que testas alguns conhecimentos em JS/Node.js.

## Pré requisitos de execução
Para executar este projeto é necessário ter instalado o [NodeJS](https://nodejs.org) e o seu gerenciador de pacotes [NPM](https://www.npmjs.com). Neste projeto foi utilizado, respectivamente as versões 10.16.0 e 6.11.3.
Além disto é necessário ter um banco de dados PostgreSQL para realizar a conexão com a aplicação.

## Informações úteis
O arquivo de configuração das credenciais do BD pode ser encontrada no arquivo 'connectionFactory.js' que está no diretório:
```
senior-test-api/app/infra/connectionFactory.js
```
Um SQL base para inicial o BD pode ser encontrado no diretório:
```
senior-test-api/db.sql
```

## Utilizando
#### Passo a passo para utilizar esta API
Clonar o projeto na sua máquina:
```
git clone https://github.com/theleoni/senior-test-api.git
```
Entrar no diretório recém criado:
```
cd senior-test-api
```
Baixar as dependência do projeto:
```
npm i
```
Executar a API:
```
npm run dev
```

## Realizando requisições
Para acessar a API faça as requisições na URL: [http://localhost:3000](http://localhost:3000)

Os métodos para acessar a API utilizando o padrão REST e estão disponíveis nas seguites URLs:
1. http://localhost:3000/hospede
2. http://localhost:3000/checkin
