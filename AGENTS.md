# AGENTS.md — Reglas de Código (P25)

## Arquitectura: MVC + Service Layer

```
Ruta/Middleware → Controlador → Servicio → Dominio
```

## Reglas Obligatorias

1. **No mezclar capas**: El controlador solo llama al servicio. El servicio nunca importa `req`/`res`. El dominio no tiene dependencias externas.
2. **Variables de entorno**: Siempre desde `src/utils/config.js`, nunca `process.env` directo.
3. **Errores**: Usar `setError()` de `errorCodes.js` y `sendError()` en el controlador.
4. **Schemas Zod**: Cada endpoint tiene su schema en `schemas/`. Siempre incluir `x-clientid` (obligatorio) y `x-traceid` (opcional).
5. **Tests**: Todo código nuevo tiene tests en `test/unit-test/`. Mockear conectores externos con `vi.mock()`. Cobertura mínima **≥ 85%**.
6. **ESM**: Siempre especificar extensión `.js` en imports: `import { foo } from './foo.js'`.
7. **Logging**: Usar `logger` de `@tigo/logger`. Nunca `console.log`. Usar `startTimer()`/`endTimer()` en controladores.
8. **Evitar código muerto (SonarQube)**: No crear variables o instancias que no se usen. Si se instancia un objeto para validar (ej. `new Punto()`), la variable debe ser utilizada después (ej. pasarla al constructor del modelo). Si no se necesita el objeto, usar una validación estática en su lugar.

## Orden para un nuevo endpoint

`schemas/` → `domain/` → `services/` → `controllers/` → `middleware/` → `routes/` → `test/`
