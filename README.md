# NoteMax-API

Una API para gestionar notas en una aplicación web.

## Instalación

Asegúrate de tener Node.js y npm instalados. Luego, ejecuta:

```bash
npm install
```

# configuracion
```
PORT=tu_puerto
CLAVE_ENCRIPTADO=tu_cave_de_encriptado_de_32bits
SECRETKEY=tu_secretkey_de_32bits
HOST=tu_host
DB_USER=tu_usuario_de_bd
PASSWORD=tu_contraseña_de_bd
DATABASE=tu_nombre_de_bd
```

# Uso

Para iniciar la API, ejecuta:
```
npm start
```


# Endpoints

A continuación se detallan los principales endpoints de la API:

### Obtener todas las notas

- **Método:** `GET`
- **Ruta:** `/api/notes`
- **Descripción:** Obtiene todas las notas.

### Obtener una nota por ID

- **Método:** `GET`
- **Ruta:** `/api/notes/:id`
- **Descripción:** Obtiene una nota específica por su ID.

### Crear una nueva nota

- **Método:** `POST`
- **Ruta:** `/api/notes`
- **Descripción:** Crea una nueva nota.

### Eliminar una nota

- **Método:** `DELETE`
- **Ruta:** `/api/notes/:id`
- **Descripción:** Elimina una nota específica por su ID.

### Crear un nuevo usuario

- **Método:** `POST`
- **Ruta:** `/api/users`
- **Descripción:** Crea un nuevo usuario.

### Iniciar sesión

- **Método:** `POST`
- **Ruta:** `/api/login`
- **Descripción:** Inicia sesión y obtén un token de autenticación.

### Cambiar el rol de un usuario

- **Método:** `PATCH`
- **Ruta:** `/api/users/:id`
- **Descripción:** Cambia el rol de un usuario específico.

### Eliminar un usuario

- **Método:** `DELETE`
- **Ruta:** `/api/users/:id`
- **Descripción:** Elimina un usuario específico por su ID.

### Ejemplo de Solicitud (usando cURL)
- **curl http://localhost:3000/api/notes**


