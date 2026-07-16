Al analizar el proyecto actual en D:\tigo\bootcamp\project-template, vemos la estructura base de un microservicio en
Node.js (con Express/Ultimate Express).

### 🔍 ¿Qué hacer para implementar la seguridad y resolver el proyecto?

1. Crear el Middleware de Autenticación (auth.middleware.js):
   Debes crear un middleware en middleware que extraiga el token de autenticación desde los headers (por ejemplo,
   Authorization: Bearer <token> o el header específico que exija la arquitectura del bootcamp).
   • Este middleware debe verificar la validez del token.
   • Si no es válido o está ausente, debe responder con 401 Unauthorized.
   • Si es válido, llama a next() para permitir que la petición continúe.
2. Definir los Schemas de Validación de Entradas (Zod):
   El proyecto utiliza Zod para validación. Debes crear los schemas de validación de Zod en una carpeta schemas para
   los requisitos del P25:
   • /api/v1/geo/geocode: Validar que el cuerpo de la petición contenga direccion de tipo String y no esté vacío.
   • /api/v1/geo/route: Validar origen y destino como coordenadas (latitud entre -90 y 90, longitud entre -180 y 180) o direcciones válidas.
   • /api/v1/geo/distance: Validar origen y destino para calcular la distancia y duración.
3. Configurar las Rutas en router.routes.js:
   Debes registrar las rutas funcionales asociando el middleware de validación y el de autenticación:
   // Rutas de Geolocalización protegidas con autenticación
   router.post('/geo/geocode', authMiddleware, validateGeocode, geocodeController);
   router.post('/geo/route', authMiddleware, validateRoute, routeController);
   router.post('/geo/distance', authMiddleware, validateDistance, distanceController);

4. Implementar los Servicios y Controladores:
   • Crear el controlador (geo.controller.js) que maneje las peticiones.
   • Crear el servicio (geo.service.js) que implemente la lógica de llamadas al proveedor de mapas (con reintentos
   y tolerancia a fallos), integrando además la caché con Redis (@tigo/redis-connector, que ya viene importado en
   app.js).
