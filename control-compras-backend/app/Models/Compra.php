<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Compra extends Model
{
    use HasFactory;

    protected $fillable = [
        'proveedor_id',
        'usuario_id',
        'bocamina_id',
        'fecha',
        'numero_factura',
        'observaciones',
        'total',
        'estado',
    ];

    protected $casts = [
        'fecha' => 'date',
        'total' => 'decimal:2',
    ];

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class);
    }

    public function bocamina()
    {
        return $this->belongsTo(Bocamina::class);
    }

    public function detalles()
    {
        return $this->hasMany(DetalleCompra::class);
    }
}
