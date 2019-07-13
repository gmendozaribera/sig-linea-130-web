# sig-linea-130-web
---
## Sobre el proyecto

Proyecto de la materia _"Sistemas de Información Geográfica"_ (INF442) del semestre 2019-01 de la UAGRM.

---
## Componentes utilizados

Este proyecto está construido con:
- Node.JS
- Express
- EJS
- Sequelize
- Socket.IO
- Mbostok's Shapefile
- Bootstrap 4
- Motor de base de datos: PostgreSQL v11

Además, está pensada para ejecutarse en Heroku.

---
## Para ejecutar el servidor y la interfaz web de este proyecto:

1. Se debe tener la base de datos instanciada en un servidor Postgres y correctamente conectada.

2. Se debe tener los shapefiles en el directorio ```./shapefiles/``` para que los mismos puedan ser procesados.

3. Se debe tener debidamente instalada la CLI de Heroku y ejecutar:

- ```heroku local```

desde la carpeta raíz del proyecto.

**Alternativamente**, se puede ejecutar:

- ```node index```

desde la carpeta raíz del proyecto. **Sin embargo**, esto requiere algunas modificaciones para poder cargar las variables de entorno desde el archivo ```.env```. Dichas modificaciones involucran instalar el módulo ```dotenv``` y referenciarlo y configurarlo en ```./index.js```.

4. Ingresar con un navegador web a la dirección ```localhost:5000``` (o reemplace "5000" por el número de puerto especificado en el archivo .env).

---

### Sobre el archivo .env
El archivo ```.env``` (environment) especifica algunas variables de entorno requeridas para el funcionamiento del sistema. Este archivo se debe encontrar en el directorio raíz del proyecto y debe especificar las siguientes variables:

- **DB_URI:** URI para conectarse a la base de datos, con el siguiente formato: ```postgre://nombredeusuario:contraseña@host:puerto/nombre_de_la_db```

- **DB_SSL:** Especifica si se debe utilizar SSL al conectarse a la DB. Actualmente en desuso, pero se recomienda establecerla a "false" durante desarrollo local.
- **PORT:** Puerto en el cual escuchar peticiones HTTP, suele ocuparse el puerto 5000.
- **APP_SECRET:** Cadena secreta utilizada para encriptar las sesiones.
- **LOGFILE_PATH:** Ruta del archivo de texto en cual guardar las entradas registradas por la función ```log()``` definida en ```./index.js```
