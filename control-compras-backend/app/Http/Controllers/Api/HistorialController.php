<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HistorialOperacion;
use Illuminate\Http\Request;

class HistorialController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'tabla' => 'nullable|string|max:50|alpha_dash',
            'accion' => 'nullable|string|max:50|alpha_dash',
            'fecha' => 'nullable|date',
            'hora_inicio' => 'nullable|string',
            'hora_fin' => 'nullable|string',
            'search' => 'nullable|string|max:100',
            'timezone' => 'nullable|string|max:100',
        ]);

        $query = HistorialOperacion::with('usuario');

        if ($request->filled('tabla')) {
            $query->where('tabla', $request->input('tabla'));
        }
        if ($request->filled('accion')) {
            $query->where('accion', $request->input('accion'));
        }

        $timezone = $request->input('timezone', 'UTC');
        if (!preg_match('/^[a-zA-Z0-9_\-\/]+$/', $timezone)) {
            $timezone = 'UTC';
        }

        $driver = \DB::connection()->getDriverName();

        if ($request->filled('fecha')) {
            if ($driver === 'pgsql') {
                $query->whereRaw("(fecha AT TIME ZONE 'UTC' AT TIME ZONE ?)::date = ?", [$timezone, $request->input('fecha')]);
            } else {
                $query->whereDate('fecha', '=', $request->input('fecha'));
            }
        }
        if ($request->filled('hora_inicio')) {
            $horaInicio = $request->input('hora_inicio');
            if (strlen($horaInicio) === 5) {
                $horaInicio .= ':00';
            }
            if ($driver === 'pgsql') {
                $query->whereRaw("(fecha AT TIME ZONE 'UTC' AT TIME ZONE ?)::time >= ?", [$timezone, $horaInicio]);
            } else {
                $query->whereTime('fecha', '>=', $horaInicio);
            }
        }
        if ($request->filled('hora_fin')) {
            $horaFin = $request->input('hora_fin');
            if (strlen($horaFin) === 5) {
                $horaFin .= ':59';
            }
            if ($driver === 'pgsql') {
                $query->whereRaw("(fecha AT TIME ZONE 'UTC' AT TIME ZONE ?)::time <= ?", [$timezone, $horaFin]);
            } else {
                $query->whereTime('fecha', '<=', $horaFin);
            }
        }
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search, $driver) {
                $likeOp = $driver === 'pgsql' ? 'ilike' : 'like';
                $q->whereHas('usuario', function($qu) use ($search, $likeOp) {
                    $qu->where('nombre', $likeOp, "%{$search}%");
                })
                ->orWhere('tabla', $likeOp, "%{$search}%")
                ->orWhere('accion', $likeOp, "%{$search}%");

                if ($driver === 'pgsql') {
                    $q->orWhereRaw("datos_nuevos::text ilike ?", ["%{$search}%"]);
                } else {
                    $q->orWhere('datos_nuevos', 'like', "%{$search}%");
                }
            });
        }

        return response()->json($query->orderBy('fecha', 'desc')->paginate(20));
    }

    public function show($id)
    {
        return response()->json(HistorialOperacion::with('usuario')->findOrFail($id));
    }
}
