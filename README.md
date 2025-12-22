# Tournament management

Proporciona APIs REST para administrar torneos, usuarios, roles y datos de partidas de manera eficiente.

## 🔧 Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/anibalcoder/tournament-management-backend.git
cd tournament-management-backend
```

2. **Configurar entorno**

    - Crear una copia de `.env.template` y renombrar a `.env`.
    - Luego, reemplaza los valores según tus credenciales.

3. **Instala dependencias**

```bash
npm install
```

4. **Prisma**

Ejecuta los siguientes comandos para preparar Prisma en tu entorno local:

```bash
# Generar Prisma Client
npx prisma generate

# Aplicar migraciones a la base de datos
npx prisma migrate dev
```

5. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

## ⚡Turbopack en Windows: Error de Symlinks durante el desarrollo

Durante el desarrollo en **Windows**, puede ocurrir un error crítico de Turbopack al ejecutar el proyecto, mostrando mensajes como:

```bash
Turbopack Error: create symlink to node_modules/...
```

> [!IMPORTANT]
> **Este comportamiento es una limitación conocida de Turbopack en Windows durante desarrollo, no es un bug del proyecto ni del código.**

Este error puede manifestarse con **Prisma u otras dependencias**, ya que Turbopack utiliza **enlaces simbólicos (symlinks)** que requieren permisos especiales en Windows.

### Referencia oficial

Este problema ha sido discutido y documentado por la comunidad de Next.js en GitHub, donde se detallan distintas soluciones: ![discuciones](https://github.com/vercel/next.js/discussions/87462?sort=new)

> [!NOTE]
> Si no desea habilitar el Modo Desarrollador de Windows como se indica en las discusiones, puede ejecutar el proyecto utilizando Webpack con el siguiente comando: `npm run dev:webpack`