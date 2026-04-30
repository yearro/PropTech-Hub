# LuxeEstate - Premium PropTech Platform

[Spanish Version](#versión-en-español) | [English Version](#english-version)

---

## Versión en Español

LuxeEstate es una plataforma inmobiliaria de lujo diseñada para ofrecer una experiencia premium tanto a agentes como a clientes. Construida con tecnologías modernas, permite la gestión eficiente de propiedades, citas y perfiles de usuario en un entorno multilingüe y multi-moneda.

### 🚀 Reseña de Funcionalidades

#### 1. Gestión Avanzada de Propiedades
*   **CRUD Completo**: Panel administrativo para crear, editar y eliminar propiedades.
*   **Galería Dinámica**: Soporte para múltiples imágenes y visualización fluida.
*   **Geolocalización**: Integración con Leaflet y OpenStreetMap para mostrar la ubicación exacta.
*   **Estados de Propiedad**: Soporte para "Venta", "Renta", "Vendido" y "Rentado".

#### 2. Sistema de Hipoteca Inteligente
*   **Cálculo en Tiempo Real**: Permite a los usuarios estimar sus pagos mensuales ajustando el enganche, plazo y tasa de interés.
*   **Multi-Moneda**: Soporte dinámico para USD, MXN y EUR, permitiendo al usuario ver estimaciones en su moneda de preferencia con conversiones automáticas.

#### 3. Administración y Roles
*   **Control de Acceso (RBAC)**: Diferentes niveles de acceso para Administradores, Brokers, Agentes y Clientes (Viewers).
*   **Directorio de Usuarios**: Gestión de perfiles, roles y asignación de agentes a propiedades.
*   **Panel de Ajustes**: Personalización del sistema, incluyendo títulos, temas y configuraciones globales.

#### 4. Experiencia del Usuario (UX/UI)
*   **Diseño Premium**: Interfaz moderna con estética "Glassmorphism" y animaciones sutiles.
*   **Sistema de Favoritos**: Los clientes pueden guardar sus propiedades preferidas en un panel personalizado.
*   **Citas**: Sistema integrado para agendar visitas directamente con el agente responsable.
*   **Internacionalización (i18n)**: Soporte nativo para Inglés y Español.

### 🛠 Requerimientos del Sistema

*   **Node.js**: Versión 18.0 o superior (Recomendado v20+).
*   **Gestor de paquetes**: NPM, PNPM o Bun.
*   **Supabase**: Cuenta con Base de Datos, Auth y Storage (Bucket `properties`).

### 📦 Instalación

1. `git clone https://github.com/usuario/luxe-state.git`
2. `npm install`
3. Configurar `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. `npm run dev`

---

## English Version

LuxeEstate is a luxury real estate platform designed to provide a premium experience for both agents and clients. Built with modern technologies, it enables efficient management of properties, appointments, and user profiles in a multilingual and multi-currency environment.

### 🚀 Feature Overview

#### 1. Advanced Property Management
*   **Full CRUD**: Administrative panel to create, edit, and delete properties.
*   **Dynamic Gallery**: Support for multiple images and smooth visualization.
*   **Geolocation**: Integration with Leaflet and OpenStreetMap to display exact locations.
*   **Property Status**: Support for "For Sale", "For Rent", "Sold", and "Rented".

#### 2. Intelligent Mortgage System
*   **Real-time Calculation**: Allows users to estimate monthly payments by adjusting down payment, term, and interest rate.
*   **Multi-Currency**: Dynamic support for USD, MXN, and EUR, allowing users to view estimates in their preferred currency with automatic conversions.

#### 3. Administration & Roles
*   **Role-Based Access Control (RBAC)**: Different access levels for Administrators, Brokers, Agents, and Clients (Viewers).
*   **User Directory**: Management of profiles, roles, and agent-to-property assignments.
*   **Settings Panel**: System customization, including titles, themes, and global settings.

#### 4. User Experience (UX/UI)
*   **Premium Design**: Modern interface with "Glassmorphism" aesthetics and subtle animations.
*   **Favorites System**: Clients can save their preferred properties in a personalized panel.
*   **Appointments**: Integrated system to schedule visits directly with the responsible agent.
*   **Internationalization (i18n)**: Native support for English and Spanish.

### 🛠 System Requirements

*   **Node.js**: Version 18.0 or higher (v20+ recommended).
*   **Package Manager**: NPM, PNPM, or Bun.
*   **Supabase**: Account with Database, Auth, and Storage (`properties` bucket).

### 📦 Installation

1. `git clone https://github.com/usuario/luxe-state.git`
2. `npm install`
3. Configure `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. `npm run dev`

---

## 🏗 Tech Stack / Tecnologías
*   **Frontend**: Next.js (App Router), React 19.
*   **Styling**: Tailwind CSS 4.
*   **Backend**: Supabase (PostgreSQL, Auth, Storage).
*   **Finance Logic**: Money.js.
*   **Maps**: Leaflet / React Leaflet.

## 📄 License / Licencia
This project is private and for the exclusive use of **LuxeEstate**. / Este proyecto es privado y para uso exclusivo de **LuxeEstate**.
