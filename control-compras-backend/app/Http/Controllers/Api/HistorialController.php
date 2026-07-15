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

        if ($request->filled('fecha')) {
            $query->whereRaw("(fecha AT TIME ZONE 'UTC' AT TIME ZONE ?)::date = ?", [$timezone, $request->input('fecha')]);
        }
        if ($request->filled('hora_inicio')) {
            $query->whereRaw("(fecha AT TIME ZONE 'UTC' AT TIME ZONE ?)::time >= ?", [$timezone, $request->input('hora_inicio')]);
        }
        if ($request->filled('hora_fin')) {
            $query->whereRaw("(fecha AT TIME ZONE 'UTC' AT TIME ZONE ?)::time <= ?", [$timezone, $request->input('hora_fin')]);
        }
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('accion', 'like', "%{$search}%")
                  ->orWhere('tabla', 'like', "%{$search}%")
                  ->orWhereHas('usuario', function($qu) use ($search) {
                      $qu->where('nombre', 'like', "%{$search}%");
                  });
            });
        }

        return response()->json($query->orderBy('fecha', 'desc')->paginate(20));
    }

    public function show($id)
    {
        return response()->json(HistorialOperacion::with('usuario')->findOrFail($id));
    }
}
