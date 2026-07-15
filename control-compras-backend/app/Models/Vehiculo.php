<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehiculo extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tipo',
        'placa',
        'marca',
        'modelo',
        'conductor_id',
        'estado'
    ];

    public function conductor()
    {
        return $this->belongsTo(User::class, 'conductor_id');
    }

    public function servicios()
    {
        return $this->hasMany(Servicio::class, 'equipo_id')->where('equipo_tipo', 'vehiculo');
    }
}
