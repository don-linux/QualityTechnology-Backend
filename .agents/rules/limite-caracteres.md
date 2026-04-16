---
description: "Límite de caracteres: db.sql como fuente de verdad + validación .length en controller con 400."
alwaysApply: true
---

# Límite de caracteres (backend)

El backend es la **fuente de verdad** del límite. El frontend lo espeja para feedback inmediato, pero la validación autoritativa vive aquí.

## 1. DB como fuente de verdad

Declara el tipo real en `db.sql` con `varchar(N)`:

```sql
fc_motivo         character varying(300),
fc_observaciones  character varying(500),
```

Cuando cambies el límite, actualiza `db.sql` **y** todos los controllers que lo validan. No confíes solo en `maxLength` del frontend: cualquier cliente (Postman, Bruno, integraciones) puede saltárselo.

## 2. Validación en el controller

En `create` y `update`, valida la longitud antes de llamar al modelo. Si se supera, devuelve `400` con un mensaje claro:

```js
static async create(req, res) {
    try {
        const { fc_motivo, fc_observaciones } = req.body;

        if (fc_motivo && fc_motivo.length > 300) {
            return res.status(400).json({ error: "El motivo no puede superar los 300 caracteres." });
        }
        if (fc_observaciones && fc_observaciones.length > 500) {
            return res.status(400).json({ error: "Las observaciones no pueden superar los 500 caracteres." });
        }

        // ...
    } catch (error) {
        // ...
    }
}
```

Aplica la **misma** validación en `update` (ver `src/controllers/bitacoraVisitaController.js` como referencia canónica). Usa los mismos números en ambos handlers y mantén el contrato reflejado en `swagger.yaml`.

## 3. Valores actuales

| Campo              | Límite | Tabla                                         |
|--------------------|-------:|-----------------------------------------------|
| `fc_motivo`        |    300 | `bitacora_visitas`                            |
| `fc_observaciones` |    500 | `bitacora_visitas` (alineado con recepción)   |

## 4. Checklist al añadir un campo de texto libre

- [ ] `varchar(N)` declarado en `db.sql` (ver regla `keep-db-updated`).
- [ ] Validación `.length > N` en `create` y `update` del controller con `400` y mensaje claro.
- [ ] Campo y límite reflejados en `swagger.yaml`.
- [ ] Frontend espeja `N` en `inputProps.maxLength` + `helperText` con contador.
