<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AlquilerGrua extends Model
{
    use HasFactory;

    protected $fillable = [
        'placa_grua',
        'capacidad_carga',
        'nombre_chofer',
        'tiempo_trabajo',
        'costo',
        'bocamina_id'
    ];

    public function bocamina()
    {
        return $this->belongsTo(Bocamina::class);
    }
}
