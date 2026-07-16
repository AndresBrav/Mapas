# Funcionamiento del Sistema — Geolocalización y Rutas (P25)

Este documento describe de manera clara y detallada el funcionamiento del microservicio de **Geolocalización y Rutas**, definiendo los endpoints REST, el flujo de procesamiento de datos y la estrategia interna de caché (basado en el documento de requisitos oficiales `Requisitos_P25_Geolocalización_y_Rutas.docx`).

---

## 1. Geocodificar Dirección

*   **Endpoint:** `POST /api/v1/geo/geocode`
*   **Descripción:** Convierte una dirección de texto en coordenadas geográficas (latitud y longitud).

### Estructura de Petición (Request)
Recibe un JSON con la dirección a buscar. La dirección no debe estar vacía.

```json
{
    "address": "Av. América 123, Cochabamba, Bolivia"
}
```

### Flujo de Ejecución
1. El cliente envía la dirección física en formato de texto.
2. El servicio valida que la dirección no esté vacía.
3. Se verifica si el resultado ya se encuentra en la memoria caché interna (ver sección 4).
4. Si no está en caché, se consulta al proveedor de mapas (por ejemplo, Google Maps o HERE API) a través del conector de **Tigo Library**.
5. Se obtienen las coordenadas y se guardan en la caché para futuras consultas.

### Estructura de Respuesta (Response)
Retorna la dirección normalizada junto a su latitud y longitud.

```json
{
    "success": true,
    "data": {
        "address": "Av. América 123, Cochabamba, Bolivia",
        "latitude": -17.39345,
        "longitude": -66.15678
    }
}
```

### Escenario de Validación (Dirección vacía)
Si el campo `address` es enviado en blanco o nulo:

*   **Request:**
    ```json
    {
        "address": ""
    }
    ```
*   **Response (400 Bad Request):**
    ```json
    {
        "success": false,
        "message": "Address is required."
    }
    ```

---

## 2. Calcular Ruta

*   **Endpoint:** `POST /api/v1/geo/route`
*   **Descripción:** Obtiene el recorrido detallado (lista de puntos geográficos) entre un origen y un destino especificados mediante coordenadas.

### Estructura de Petición (Request)
Recibe las coordenadas de latitud y longitud para el origen y el destino.

```json
{
    "origin": {
        "latitude": -17.39345,
        "longitude": -66.15678
    },
    "destination": {
        "latitude": -17.38020,
        "longitude": -66.15010
    }
}
```

### Flujo de Ejecución
1. El cliente envía las coordenadas de origen y destino.
2. El servicio valida que las coordenadas estén dentro del rango geográfico correcto (-90 a 90 para latitud, y -180 a 180 para longitud).
3. Se invoca al proveedor de mapas a través de **Tigo Library**.
4. El proveedor calcula la mejor ruta terrestre.
5. Se retorna la distancia, duración estimada y el listado de puntos geográficos (`path`) del recorrido.

### Estructura de Respuesta (Response)
```json
{
    "success": true,
    "data": {
        "origin": {
            "latitude": -17.39345,
            "longitude": -66.15678
        },
        "destination": {
            "latitude": -17.38020,
            "longitude": -66.15010
        },
        "distanceKm": 3.7,
        "durationMinutes": 11,
        "path": [
            {
                "latitude": -17.39345,
                "longitude": -66.15678
            },
            {
                "latitude": -17.39000,
                "longitude": -66.15400
            },
            {
                "latitude": -17.38500,
                "longitude": -66.15200
            },
            {
                "latitude": -17.38020,
                "longitude": -66.15010
            }
        ]
    }
}
```

---

## 3. Calcular Distancia y Tiempo

*   **Endpoint:** `POST /api/v1/geo/distance`
*   **Descripción:** Calcula únicamente la distancia métrica y la duración estimada del trayecto entre dos coordenadas, omitiendo el listado de puntos de la ruta para optimizar el ancho de banda y rendimiento.

### Estructura de Petición (Request)
```json
{
    "origin": {
        "latitude": -17.39345,
        "longitude": -66.15678
    },
    "destination": {
        "latitude": -17.38020,
        "longitude": -66.15010
    }
}
```

### Estructura de Respuesta (Response)
Cualquiera de los siguientes formatos de respuesta es considerado válido:

*   **Opción A (Numérico):**
    ```json
    {
        "success": true,
        "data": {
            "distanceKm": 3.7,
            "durationMinutes": 11
        }
    }
    ```
*   **Opción B (Formateado en texto):**
    ```json
    {
        "success": true,
        "data": {
            "distance": "3.7 km",
            "duration": "11 min"
        }
    }
    ```

---

## 4. Caché de Resultados (Proceso Interno)

La caché de geocodificación **no expone un endpoint público** (no existe un `POST /cache`). Es un mecanismo de optimización interno del backend (*Cache-Aside Pattern*).

### Flujo de Primera Consulta (Cache Miss)
Cuando se solicita una dirección por primera vez:

```
[Cliente] ---> (POST /geocode) ---> [Backend]
                                       |
                                       v
                             ¿Existe en Caché?
                                    |-- NO --> [Proveedor de Mapas (Externo)]
                                                     | (Obtiene Lat/Lng)
                                                     v
                                            [Guardar en Caché]
                                                     |
[Cliente] <--- (Respuesta 200 OK) <------------------+
```

### Flujo de Consultas Posteriores (Cache Hit)
Cuando se vuelve a consultar exactamente la misma dirección:

```
[Cliente] ---> (POST /geocode) ---> [Backend]
                                       |
                                       v
                             ¿Existe en Caché?
                                    |-- SÍ (Retorna coordenadas de inmediato)
                                    v
[Cliente] <--- (Respuesta Rápida) <-+  (No consume llamada al proveedor externo)
```

---

## 5. Resiliencia y Tolerancia a Fallos
*   **Rate Limiting:** Controla la cantidad máxima de peticiones concurrentes enviadas al proveedor de mapas para evitar la suspensión de la API Key.
*   **Políticas de Reintento (Retry Policy):** Ante caídas temporales de la API de mapas externa, el sistema reintenta la petición de manera automática con *exponential backoff* antes de reportar un fallo al cliente.
