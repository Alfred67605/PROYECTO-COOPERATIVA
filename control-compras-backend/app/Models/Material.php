<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $table = 'materiales';

    protected $fillable = [
        'codigo',
        'descripcion',
        'grupo',
        'imagen',
        'estado',
    ];

    public function detalleCompras()
    {
        return $this->hasMany(DetalleCompra::class);
    }
}
