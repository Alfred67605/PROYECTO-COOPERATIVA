<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ $titulo }} — Minera Cop</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            color: #1a2332;
            background: #ffffff;
        }

        /* ── Cabecera ─────────────────────────────────────── */
        .header {
            background: #1a2332;
            color: #ffffff;
            padding: 18px 24px;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 20px;
            font-weight: 900;
            letter-spacing: 0.5px;
            color: #d96a43;
        }
        .header p {
            font-size: 10px;
            color: #94a3b8;
            margin-top: 4px;
        }

        /* ── Resumen ──────────────────────────────────────── */
        .summary {
            display: table;
            width: 100%;
            border-collapse: separate;
            border-spacing: 12px;
            margin-bottom: 20px;
            padding: 0 12px;
        }
        .summary-box {
            display: table-cell;
            background: #f8fafc;
            border-left: 4px solid #d96a43;
            padding: 12px 16px;
            border-radius: 4px;
        }
        .summary-value {
            font-size: 22px;
            font-weight: 900;
            color: #d96a43;
        }
        .summary-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #64748b;
            margin-top: 3px;
        }

        /* ── Tabla ────────────────────────────────────────── */
        .table-wrapper {
            padding: 0 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-bottom: 20px;
        }
        thead tr th {
            background: #1a2332;
            color: #ffffff;
            padding: 8px 10px;
            text-align: left;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        thead tr th.text-right { text-align: right; }

        tbody tr td {
            padding: 7px 10px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
        }
        tbody tr:nth-child(even) td { background: #f8fafc; }
        tbody tr:hover td { background: #f1f5f9; }
        .td-right { text-align: right; font-weight: 700; color: #d96a43; }
        .td-mono { font-family: monospace; color: #64748b; font-size: 9px; }

        /* ── Fila total ───────────────────────────────────── */
        .total-row td {
            background: #1a2332 !important;
            color: #ffffff !important;
            font-weight: 900;
            padding: 9px 10px;
            font-size: 11px;
        }
        .total-row .td-right {
            color: #d96a43 !important;
        }

        /* ── Footer ───────────────────────────────────────── */
        .footer {
            margin-top: 24px;
            text-align: center;
            color: #94a3b8;
            font-size: 9px;
            border-top: 1px solid #e2e8f0;
            padding: 10px 12px;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>&#128203; {{ $titulo }} — Minera Cop</h1>
        <p>{{ $periodoTexto }} &nbsp;|&nbsp; Generado el {{ $fecha }}</p>
    </div>

    <div class="summary">
        @if(isset($compras) && $compras->count() > 0)
        <div class="summary-box">
            <div class="summary-value">{{ $compras->count() }}</div>
            <div class="summary-label">Total de compras</div>
        </div>
        @endif
        @if(isset($servicios) && $servicios->count() > 0)
        <div class="summary-box">
            <div class="summary-value">{{ $servicios->count() }}</div>
            <div class="summary-label">Total de servicios</div>
        </div>
        @endif
        <div class="summary-box">
            <div class="summary-value">${{ number_format($gastoTotal, 2) }}</div>
            <div class="summary-label">Gasto Total del Periodo</div>
        </div>
    </div>

    @if(isset($compras) && $compras->count() > 0)
    <div class="table-wrapper">
        <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #1a2332; text-transform: uppercase;">Compras</h3>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Proveedor</th>
                    <th>N&ordm; Factura</th>
                    <th>Bocamina</th>
                    <th>Responsable</th>
                    <th class="text-right">Total ($)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($compras as $c)
                <tr>
                    <td class="td-mono">#{{ $c->id }}</td>
                    <td>{{ $c->fecha->format('d/m/Y') }}</td>
                    <td>{{ $c->proveedor->nombre ?? '-' }}</td>
                    <td>{{ $c->numero_factura ?: '-' }}</td>
                    <td>{{ $c->bocamina->nombre ?? 'Central' }}</td>
                    <td>{{ $c->usuario->nombre ?? '-' }}</td>
                    <td class="td-right">${{ number_format($c->total, 2) }}</td>
                </tr>
                @endforeach

                <tr class="total-row">
                    <td colspan="6">TOTAL COMPRAS</td>
                    <td class="td-right">${{ number_format($gastoTotal - $gastoTotalServicios, 2) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    @endif

    @if(isset($servicios) && $servicios->count() > 0)
    <div class="table-wrapper">
        <h3 style="font-size: 12px; font-weight: bold; margin-top: 10px; margin-bottom: 8px; color: #1a2332; text-transform: uppercase;">Servicios y Mantenimiento</h3>
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Fecha</th>
                    <th>Equipo</th>
                    <th>Bocamina</th>
                    <th>Responsable</th>
                    <th>Estado</th>
                    <th class="text-right">Total ($)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($servicios as $s)
                @php
                    $costoTotal = $s->costos->sum('monto') + $s->repuestos->sum(function($r) { return $r->cantidad * $r->costo_unitario; });
                    $tipoLimpio = class_basename($s->equipo_tipo);
                    if ($tipoLimpio === 'Vehiculo') {
                        $tipoLimpio = 'Vehículo';
                    }
                @endphp
                <tr>
                    <td class="td-mono">{{ $s->codigo }}</td>
                    <td>{{ \Carbon\Carbon::parse($s->fecha)->format('d/m/Y') }}</td>
                    <td>{{ $tipoLimpio }} ({{ $s->equipo->placa ?? $s->equipo->nombre_codigo ?? $s->equipo->codigo ?? '-' }})</td>
                    <td>{{ $s->bocamina->nombre ?? 'Central' }}</td>
                    <td>{{ $s->responsable->nombre ?? '-' }}</td>
                    <td>{{ $s->estado }}</td>
                    <td class="td-right">${{ number_format($costoTotal, 2) }}</td>
                </tr>
                @endforeach

                <tr class="total-row">
                    <td colspan="6">TOTAL SERVICIOS</td>
                    <td class="td-right">${{ number_format($gastoTotalServicios, 2) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    @endif

    @if(($tipo === 'todos') && isset($compras) && $compras->count() > 0 && isset($servicios) && $servicios->count() > 0)
    <div class="table-wrapper">
        <table>
            <tbody>
                <tr class="total-row">
                    <td colspan="6">TOTAL GENERAL (COMPRAS + SERVICIOS)</td>
                    <td class="td-right">${{ number_format($gastoTotal, 2) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    @endif

    <div class="footer">
        Reporte generado autom&aacute;ticamente por el Sistema de Control de Compras &mdash; Minera Cop
    </div>

</body>
</html>
