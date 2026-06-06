# Daily Task Tracker

Aplicación mobile para el seguimiento de tareas diarias. Enfocada en la simplicidad y funcionalidad. El objetivo es crear una aplicación multiplataforma que permita a los usuarios gestionar sus tareas diarias de manera eficiente.

## Stack

- Ionic + Angular 
- Cordova 
- Soporte para: iOS y Android

## Plugins Oficiales y Herramientas

- [Firebase Analytics](https://github.com/chemerisuk/cordova-plugin-firebase-analytics) - Análisis de uso y comportamiento de los usuarios
- [Firebase Crashlytics](https://github.com/chemerisuk/cordova-plugin-firebase-crashlytics) - Reporte automático de errores nativos y excepciones en tiempo real
- [Firebase Config](https://github.com/chemerisuk/cordova-plugin-firebase-config) - Configuración remota (Remote Config) para la aplicación
- [SQLite Storage](https://github.com/storesafe/cordova-sqlite-storage) - Almacenamiento local de base de datos SQLite para Cordova
- **Plugins nativos base:** Device, Statusbar, Splashscreen, Ionic Keyboard, Ionic Webview.

## Versión de construcción

- Angular CLI: 20.0.0
- TypeScript: 5.9.0
- @ionic/angular: 8.0.0
- @ionic/angular-toolkit: 12.0.0
- Cordova Android: 15.0.0
- Cordova iOS: 8.1.0

## Inicialización

1. Descargar e instalar Node.js (se recomienda la versión LTS más reciente)
2. Clonar este repositorio
3. Instalar dependencias para la ejecución del proyecto:
   ```bash
   npm install
   ```
4. Ejecutar el proyecto de forma local para trabajar en modo desarrollo. Existen dos formas:
   - **En el navegador web (básico):**
     ```bash
     ionic serve
     ```
   - **En un emulador de iOS con Live Reload (Más estable y recomendado):**
     Permite probar características nativas mientras el código se recarga automáticamente al guardar los cambios:
     ```bash
     npx cordova run ios -l --external
     ```

## Construcción de entornos de trabajo y Producción

El objetivo de estos comandos es compilar la aplicación y generar los artefactos web (que se alojan en la carpeta **www**), para luego integrarlos en las plataformas nativas.

1. Construir la versión web para producción:
   ```bash
   npm run build
   ```
2. Preparar el entorno nativo e inyectar el código a las plataformas (iOS/Android):
   ```bash
   npx cordova prepare
   ```
3. Compilar y correr en emulador o dispositivo físico:
   ```bash
   npx cordova run android
   # o
   npx cordova run ios
   ```

> **Nota para iOS:** Para poder compilar la plataforma de iOS y gestionar dependencias nativas (como los plugins de Firebase), es estrictamente necesario tener instalado **[CocoaPods](https://cocoapods.org/)** en tu Mac. Puedes instalarlo con `brew install cocoapods` o `sudo gem install cocoapods`.

## Integración de Firebase en Cordova

El uso de los plugins nativos de Firebase para Cordova nos facilita la telemetría y diagnóstico en vivo de la aplicación:

- **Soporte de Crashlytics:** Permite monitorear fallos severos tanto en código web como en código nativo de Java/Swift/Objective-C.
- **Configuración obligatoria:** Para que Firebase inicie correctamente, es estrictamente obligatorio tener los archivos de credenciales proporcionados por Google Console (`google-services.json` para Android y `GoogleService-Info.plist` para iOS) alojados en la raíz del proyecto antes de realizar un build de Cordova.