# Usamos una imagen base de Node.js
FROM node:20-alpine

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package.json package-lock.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código del proyecto
COPY . .

# Exponemos el puerto que usa Next.js por defecto
EXPOSE 3000

# Comando para correr la app en modo desarrollo
CMD npm run dev