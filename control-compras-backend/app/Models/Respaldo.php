<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Respaldo extends Model
{
    use HasFactory;

    protected $table = 'respaldos';

    protected $fillable = [
        'nombre_archivo',
        'tipo',
        'tamano',
        'estado',
        'creado_por',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'creado_por');
    }
}
