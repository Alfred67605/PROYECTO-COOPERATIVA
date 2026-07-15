<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Compras — Minera Cop</title>
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
            width: 50%;
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
        <h1>&#128203; Reporte de Compras — Minera Cop</h1>
        <p>{{ $periodoTexto }} &nbsp;|&nbsp; Generado el {{ $fecha }}</p>
    </div>

    <div class="summary">
        <div class="summary-box">
            <div class="summary-value">{{ $compras->count() }}</div>
            <div class="summary-label">Total de compras</div>
        </div>
        <div class="summary-box">
            <div class="summary-value">${{ number_format($gastoTotal, 2) }}</div>
            <div class="summary-label">Gasto Total del Periodo</div>
        </div>
    </div>

    <div class="table-wrapper">
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
                @forelse($compras as $c)
                <tr>
                    <td class="td-mono">#{{ $c->id }}</td>
                    <td>{{ $c->fecha->format('d/m/Y') }}</td>
                    <td>{{ $c->proveedor->nombre ?? '-' }}</td>
                    <td>{{ $c->numero_factura ?: '-' }}</td>
                    <td>{{ $c->bocamina->nombre ?? 'Central' }}</td>
                    <td>{{ $c->usuario->nombre ?? '-' }}</td>
                    <td class="td-right">${{ number_format($c->total, 2) }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" style="text-align:center; color:#94a3b8; padding: 20px;">
                        No hay compras en este periodo.
                    </td>
                </tr>
                @endforelse

                <tr class="total-row">
                    <td colspan="6">TOTAL GENERAL</td>
                    <td class="td-right">${{ number_format($gastoTotal, 2) }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="footer">
        Reporte generado autom&aacute;ticamente por el Sistema de Control de Compras &mdash; Minera Cop
    </div>

</body>
</html>
