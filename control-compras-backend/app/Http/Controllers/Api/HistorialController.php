<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HistorialOperacion;
use Illuminate\Http\Request;

class HistorialController extends Controller
{
    public function index(Request $request)
    {
        $query = HistorialOperacion::with('usuario');

        if ($request->has('tabla')) {
            $query->where('tabla', $request->tabla);
        }
        if ($request->has('accion')) {
            $query->where('accion', $request->accion);
        }

        return response()->json($query->orderBy('fecha', 'desc')->paginate(20));
    }

    public function show($id)
    {
        return response()->json(HistorialOperacion::with('usuario')->findOrFail($id));
    }
}
