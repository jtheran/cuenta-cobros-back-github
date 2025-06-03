# Usa la versión 22 de Node.js
FROM node:22

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias primero para aprovechar el cache de Docker
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Expone el puerto del backend
EXPOSE 3495


