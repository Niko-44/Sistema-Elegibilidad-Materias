
#!/bin/bash

# Script para reiniciar tu contenedor Docker "sistema-elegibilidad"

# 1️⃣ Obtener el ID del contenedor que usa la imagen comunicable-api
CONTAINER_ID=$(docker ps -q --filter "ancestor=sistema-elegibilidad")

if [ -z "$CONTAINER_ID" ]; then
  echo "No hay contenedores corriendo con la imagen 'sistema-elegibilidad'."
else
  echo "Parando contenedor: $CONTAINER_ID"
  docker stop "$CONTAINER_ID"

  echo "Eliminando contenedor: $CONTAINER_ID"
  docker rm "$CONTAINER_ID"
fi

# 2️⃣ Construir la nueva imagen
echo "Construyendo la imagen 'comunicable-api'..."
docker build -t comunicable-api .

# 3️⃣ Ejecutar el contenedor en segundo plano
echo "Ejecutando el contenedor..."
docker run -d -p 8080:8080 comunicable-api

echo "✅ Contenedor reiniciado correctamente."
