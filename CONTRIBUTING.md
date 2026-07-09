# Contributing

Flujo corto de trabajo para contribuir al repositorio.

## Flujo estándar

1. Clona el repositorio.
2. Cambia a la rama `dev` y actualízala.
3. Crea tu rama desde `dev`.
4. Desarrolla, haz commit y push de tu rama.
5. Abre un Pull Request **hacia `dev`**.
6. Al finalizar (merge), vuelve a `dev`, actualiza y repite.

## Nomenclatura de ramas

- `feature/<descripcion-corta>`
- `fix/<descripcion-corta>`
- `chore/<descripcion-corta>`
- `docs/<descripcion-corta>`
- `refactor/<descripcion-corta>`

Ejemplos:
- `feature/login-jwt`
- `fix/error-cors`

## Comandos

```bash
# 1) Clonar
git clone <repo-url>
cd <repo-folder>

# 2) Ir a dev y actualizar
git checkout dev
git pull origin dev

# 3) Crear rama desde dev
git checkout -b feature/mi-cambio

# 4) Trabajar, commit y push
git add .
git commit -m "feat: descripcion corta del cambio"
git push -u origin feature/mi-cambio

# 5) Abrir PR en GitHub: feature/mi-cambio -> dev

# 6) Después del merge, limpiar y repetir
git checkout dev
git pull origin dev
git branch -d feature/mi-cambio
```

## Regla clave

Todo cambio debe entrar por Pull Request a `dev`.
