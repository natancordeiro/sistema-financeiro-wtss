# Etapa 1: Build da aplicação
FROM node:18 AS build
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos
COPY . .

# Executa o build de produção
RUN npm run build

# Etapa 2: Servir com NGINX
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove configuração default do NGINX
RUN rm /etc/nginx/conf.d/default.conf

# Copia os arquivos buildados
COPY --from=build /app/dist ./

# Copia a configuração personalizada do NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o NGINX
CMD ["nginx", "-g", "daemon off;"]
