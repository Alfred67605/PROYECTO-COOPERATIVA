#!/bin/sh
set -e

echo "=== Ejecutando migraciones y limpiando caché de Laravel en Dokploy ==="
php artisan config:clear || true
php artisan route:clear || true
php artisan cache:clear || true
php artisan storage:link 2>/dev/null || true

echo "=== Ejecutando php artisan migrate --force ==="
php artisan migrate --force || true

echo "=== Iniciando Supervisord ==="
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/app.conf
