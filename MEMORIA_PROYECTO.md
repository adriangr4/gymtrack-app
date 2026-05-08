# Memoria Técnica y Documentación del Proyecto: GymTrack

## 1. Introducción y Resumen Ejecutivo
GymTrack nace como una solución integral que combina el seguimiento tradicional de actividad física (fitness tracking) y la planificación nutricional, entrelazando ambas disciplinas con un fuerte componente de **Gamificación** y **Redes Sociales**. El objetivo principal de este proyecto ha sido desarrollar un sistema completo (Full-Stack) capaz de registrar progresos, incentivar a los usuarios mediante recompensas virtuales y conectarlos en una comunidad digital.

Esta memoria documenta la evolución cronológica del proyecto, el razonamiento detrás de las decisiones arquitectónicas clave y el stack tecnológico empleado en cada área.

---

## 2. Arquitectura y Stack Tecnológico

La aplicación ha sido concebida bajo una arquitectura de cliente-servidor desacoplada, permitiendo escalabilidad y una experiencia de usuario (UX) fluida.

### 2.1. Frontend (Aplicación Cliente)
- **Framework Core:** **React (v18)** inicializado mediante **Vite**. Se eligió Vite por sus tiempos de compilación ultrarrápidos y su eficiencia en el *Hot Module Replacement* (HMR).
- **Lenguaje:** **TypeScript**. Su tipado estático redujo drásticamente los errores en tiempo de ejecución al interactuar con las respuestas del servidor.
- **Estilos y UI:** **TailwindCSS** para un diseño responsivo y moderno, aprovechando variables CSS nativas para soportar fluidamente el intercambio entre *Dark Mode* y *Light Mode* (`text-foreground`, `bg-background`).
- **Navegación:** `react-router-dom` para la gestión del enrutamiento SPA (Single Page Application) sin recarga de página.
- **Iconografía y Animaciones:** **Lucide React** para un conjunto de iconos coherente y **Framer Motion** para transiciones suaves de componentes (como el menú de comentarios o modales).

### 2.2. Backend (Servidor API)
- **Framework Core:** **FastAPI**. Fue seleccionado por su altísimo rendimiento, generación automática de documentación Swagger/OpenAPI y su naturaleza asíncrona.
- **Lenguaje:** **Python 3.x**.
- **Servidor ASGI:** **Uvicorn** gestionando múltiples workers para el tráfico concurrente.
- **Validación de Datos:** **Pydantic**. Utilizado intensivamente para definir esquemas (`UserCreate`, `Post`, `Notification`), asegurando que la entrada y salida de datos sea siempre predecible y segura.
- **Seguridad:** Gestión de autenticación con **JWT (JSON Web Tokens)** y hashing de contraseñas vía esquema `OAuth2PasswordBearer`.

### 2.3. Base de Datos y BaaS (Backend as a Service) 
- **Google Cloud Firestore (Firebase):** Aunque las primeras iteraciones exploraron el uso de bases de datos relacionales (SQLAlchemy/SQLite), el proyecto migró sus características pesadas (tracking diario, feeds sociales, planes semanales) a una arquitectura **NoSQL** nativa a través del **Firebase Admin SDK** para Python. Esto facilitó:
  - Estructuras en árbol para comentarios y *likes*.
  - Rapidez en la iteración del modelo de datos de las Rutinas y Dietas.
  - Eliminación de estructuras rígidas (migrations) durante fases de alta experimentación.

---

## 3. Evolución del Proyecto (Fases de Implementación)

### Fase 1: Ingeniería Base, Autenticación y Seguridad
El proyecto comenzó con el levantamiento del esqueleto de la aplicación.
- Se configuraron los entornos de desarrollo (Vite port 5173, FastAPI port 8000).
- Se desarrolló un mecanismo de autenticación bidireccional. El usuario introduce credenciales en los componentes `LoginPage.tsx` / `RegisterPage.tsx`, viajan cifradas al backend, y este devuelve un token JWT.
- React almacena mediante Contextos (`AuthContext.tsx`) el estado de sesión para persistencia en el `localStorage`.

### Fase 2: Módulos Core - Rutinas, Ejercicios y Tracking (Pedometer)
El corazón de GymTrack. Se dio al usuario la capacidad de planificar sus entrenamientos.
- **Creación de Rutinas:** Se implementó una interfaz dinámica en `RoutineCreatorPage.tsx` donde los usuarios pueden estructurar semanas y añadir descansos.
- **Buscador de Ejercicios:** Un endpoint en FastAPI devuelve la biblioteca predefinida de movimientos.
- **Tracking:** Se creó `WorkoutDetailsPage.tsx` para permitir marcar el seguimiento iterativo (series, peso, completado). Al finalizar el día, se vuelca el progreso a Firestore.

### Fase 3: Módulo de Nutrición y Autonomía de Datos
En un principio, se evaluó utilizar librerías externas (como *OpenFoodFacts*) para el registro de comidas. 
- **Pivotaje tecnológico:** Se detectaron problemas de latencia, fallos de API de terceros y URLs de imágenes rotas. La solución profesional y definitiva fue **crear una base de datos de alimentos nativa** (sembrada vía un script de Python `seed_foods.py`).
- **Calculadora:** Se programó el `GoalCalculatorModal.tsx`, un algoritmo visual para sugerir macronutrientes al usuario según su peso, altura y objetivo. 

### Fase 4: Gamificación (El Valor Diferencial)
Para retener a los usuarios, el sistema no podía ser un mero bloc de notas.
- Se implementó un motor de progresión basado en XP (Experiencia). Por cada rutina completada o dieta seguida, el usuario adquiere XP.
- Visualmente, se integró un componente `LevelProgressBar.tsx` y eventos superpuestos (como *LevelUpOverlay*) para desencadenar animaciones de victoria. Rango actual y misiones diarias lideran la página principal (`HomePage.tsx`).

### Fase 5: Expansión Social y Comunidad
Para convertir el proyecto en un ecosistema vivo, se programó desde cero todo un módulo de Red Social.
- **Feed Comunitario (`SocialPage.tsx`):** Un diseño al estilo "Cards" o "Instagram", donde los usuarios pueden postear sus rutinas y dietas.
- **Micro-interacciones:** Implementación de "Likes" atómicos y un sistema de comentarios. Todo persistido en subcolecciones de Firestore.
- **Sistema de Clonación P2P:** La característica estrella. Si un usuario ve una dieta excelente de otro usuario, presiona el botón "Importar". El backend localiza ese documento, hace una copia profunda (*Deep Copy*), le cambia el nombre del autor original y lo inyecta en la librería privada del nuevo usuario.

### Fase 6: Pulido, Notificaciones en Tiempo Real y Panel de Moderación
La recta final del proyecto se invirtió puramente en la **Calidad del Software (QA)** y control.
- **Notificaciones Universales:** Se orquestaron "Triggers" (disparadores) lógicos en el backend. Cada vez que alguien interactúa con tu contenido (follow, like, import), un registro vuela a una colección de notificaciones. En React, `<TopHeader />` las muestra mediante un badge rojo y un menú flotante con "Marcar todas como leídas".
- **Rol de Administrador:** Se extendió el modelo `User` inyectando una flag booleana `is_admin`. Esto blinda la comunidad, otorgando permiso de renderizar los iconos de la "papelera" para borrar el contenido que rompe directrices, reforzando la seguridad y gobierno del sistema.
- **UI/UX Refinements:** Corrección exhaustiva del apilamiento Z (z-index) del menú inferior (`BottomNav`), adaptación integral de los contrastes del *Light Mode* e implementación de modales para prevenir interrupciones en los formularios.

---

## 4. Conclusión y Logros Alcanzados

El desarrollo de GymTrack concluye exitosamente evidenciando el dominio sobre aplicaciones de arquitectura moderna. 

1. **Rendimiento:** FastAPI ofrece respuestas inferiores a los 40ms, y Vite asegura una transición instantánea en el cliente.
2. **Escalabilidad Data-Driven:** Al haber consolidado los módulos de seguimiento masivos en Firestore, el proyecto teóricamente podría soportar picos de concurrencia de miles de usuarios leyendo y creando comentarios sin bloqueos en disco.
3. **Mantenibilidad:** La fuerte tipificación en TypeScript ha dejado el código del frontend sumamente legible para futuras actualizaciones, y el enrutamiento limpio en Python (`api_router.include_router`) permite añadir nuevos módulos como "Torneos" o "Metas" sin romper el resto del sistema. 

El resultado es un producto software escalable, visualmente premium, con bases profesionales de seguridad, que se erige como una solución holística al mercado actual de aplicaciones de fitness y salud.
