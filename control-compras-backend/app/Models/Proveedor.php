<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{
    use HasFactory;

    protected $table = 'proveedores';

    protected $fillable = [
        'nombre',
        'telefono',
        'direccion',
        'email',
        'nit',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function compras()
    {
        return $this->hasMany(Compra::class);
    }
}
