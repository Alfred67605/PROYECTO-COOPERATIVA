<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Servicio extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'codigo',
        'fecha',
        'hora',
        'usuario_registro_id',
        'responsable_id',
        'estado',
        'equipo_tipo',
        'equipo_id',
        'boca_mina_id',
        'ubicacion_detalle',
        'tipo_mantenimiento_id',
        'descripcion',
        'fallas',
        'solucion',
        'observaciones'
    ];

    public function usuarioRegistro()
    {
        return $this->belongsTo(User::class, 'usuario_registro_id');
    }

    public function responsable()
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }

    public function equipo()
    {
        return $this->morphTo(__FUNCTION__, 'equipo_tipo', 'equipo_id');
    }

    public function repuestos()
    {
        return $this->hasMany(RepuestoServicio::class, 'servicio_id');
    }

    public function costos()
    {
        return $this->hasMany(CostoServicio::class, 'servicio_id');
    }

    public function bocamina()
    {
        return $this->belongsTo(Bocamina::class, 'boca_mina_id');
    }
}
