<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepuestoServicio extends Model
{
    use HasFactory;

    protected $fillable = [
        'servicio_id',
        'material_id',
        'cantidad',
        'costo_unitario'
    ];

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }

    public function material()
    {
        // Asumiendo que existe un modelo Material en App\Models
        return $this->belongsTo(Material::class, 'material_id');
    }
}
