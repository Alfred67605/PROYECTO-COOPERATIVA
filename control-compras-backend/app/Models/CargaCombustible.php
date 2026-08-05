<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CargaCombustible extends Model
{
    use HasFactory;

    protected $table = 'cargas_combustible';

    protected $fillable = [
        'tipo_combustible',
        'tipo_equipo',
        'vehiculo_id',
        'maquinaria_id',
        'litros',
        'monto',
        'precio_por_litro',
        'surtidor_grifo',
        'responsable',
        'fecha_hora',
        'observacion',
        'user_id',
    ];

    protected $casts = [
        'litros' => 'float',
        'monto' => 'float',
        'precio_por_litro' => 'float',
        'fecha_hora' => 'datetime',
    ];

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_id')->withTrashed();
    }

    public function maquinaria()
    {
        return $this->belongsTo(Maquinaria::class, 'maquinaria_id')->withTrashed();
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id')->withTrashed();
    }
}
