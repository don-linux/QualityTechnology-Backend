## Configuración esencial (rápida)

### Puertos esperados

- **Frontend esperado:** `http://localhost:3000`
	- Está definido en CORS dentro de `index.mjs`.
- **Backend (API):** `http://localhost:5000`
	- Se toma de `PORT` o usa `5000` por defecto.

### Variables mínimas de entorno (`.env`)

```env
PORT=5000

PGUSER=postgres
PGPASSWORD=12345
PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=quality

JWT_SECRET=tu_clave_jwt
```

### Nota rápida para Docker

- El contenedor de Express escucha internamente en `5000`.
- En `docker/dev/compose.yaml` y `docker/prod/compose.yaml` el puerto publicado depende de:
	- `DOCKER_DEV_EXPRESS_PORT`
	- `DOCKER_PROD_EXPRESS_PORT`

### Si cambias el puerto del Frontend

- Actualiza el `origin` de CORS en `index.mjs` para que coincida con la URL real del frontend.
