<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CostoServicio extends Model
{
    use HasFactory;

    protected $fillable = [
        'servicio_id',
        'tipo_costo',
        'monto',
        'descripcion'
    ];

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }
}
