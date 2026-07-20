# Resumen Ejecutivo de Pruebas de Rendimiento

**Materia**: Verificación y Validación de Software (INF780)  
**Sistema**: Control de Compras - Cooperativa Minera  
**Tecnología de Prueba**: Apache JMeter 5.6+  
**Fecha de Generación**: 2026-07-19  

---

## 1. Introducción y Objetivos
Este documento resume la estrategia, configuración y criterios de éxito establecidos para las pruebas de rendimiento del sistema de Control de Compras. El objetivo principal es evaluar la robustez, capacidad de respuesta, rendimiento y comportamiento ante diferentes niveles de carga de los 17 módulos de la API rest del sistema.

---

## 2. Metodología (INF780)
Se sigue el ciclo estándar de pruebas de rendimiento de software:
1. **Planificación**: Identificación de objetivos, escenarios y límites (establecidos en el Plan de Pruebas).
2. **Diseño del Script**: Parametrización dinámica en JMeter, simulación del flujo de autenticación por cookies/CSRF de Laravel Sanctum, aserciones y timers.
3. **Preparación de Datos**: Creación de feeders CSV con datos válidos (`usuarios.csv`, `materiales.csv`, `proveedores.csv`, `compras.csv`).
4. **Ejecución**: Pruebas en modo No-GUI utilizando comandos CLI de JMeter.
5. **Análisis y Reporte**: Evaluación frente a criterios de éxito y reporte de cuellos de botella.

---

## 3. Criterios de Éxito
Para considerar exitosa la ejecución de las pruebas, los resultados de los endpoints deben cumplir con los siguientes límites:

| Módulo / Operación | Límite Tiempo Promedio (s) | Tasa de Error Tolerada |
| :--- | :--- | :--- |
| **Inicio de Sesión (Login)** | < 1.0 s | < 1% |
| **Operaciones CRUD Normales** | < 2.0 s | < 1% |
| **Carga de Estadísticas / Dashboard** | < 2.0 s | < 1% |
| **Generación de Reportes PDF/Excel** | < 5.0 s | < 2% |
| **Global del Sistema** | < 2.0 s | < 1% (sin errores HTTP 500) |

---

## 4. Instrucciones de Ejecución

### Ejecución en Modo CLI (No-GUI) - RECOMENDADO
Para ejecutar la prueba y generar automáticamente el reporte HTML:

```bash
# Cambiar al directorio del JMeter
cd performance/JMeter

# Ejecutar el escenario por defecto (Escenario 1)
jmeter -n -t CooperativaMinera.jmx -l ../Results/resultados.jtl -e -o ../Results/dashboard-html/
```

### Modificación de Parámetros
Para habilitar otro escenario, abra `CooperativaMinera.jmx` en JMeter GUI, navegue por el árbol del plan y:
1. Haga clic derecho sobre el Thread Group que desea ejecutar y seleccione **Enable**.
2. Deshabilite el resto de Thread Groups seleccionando **Disable**.
3. Guarde y ejecute.
