<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inspeccion extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipo_tipo',
        'equipo_id',
        'motor_ok',
        'frenos_ok',
        'aceite_ok',
        'neumaticos_ok',
        'luces_ok',
        'seguridad_ok',
        'observaciones',
        'firma_responsable_id'
    ];

    public function responsable()
    {
        return $this->belongsTo(User::class, 'firma_responsable_id');
    }

    public function equipo()
    {
        return $this->morphTo(__FUNCTION__, 'equipo_tipo', 'equipo_id');
    }
}
