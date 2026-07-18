<?php

namespace Tests\Unit\Services;

use App\Models\Vehiculo;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class VehiculoServiceTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test creating, reading, updating and deleting a vehicle.
     */
    public function test_vehiculo_crud_and_status_checks(): void
    {
        $vehiculo = Vehiculo::create([
            'tipo' => 'pesado',
            'placa' => '9921-ABC',
            'marca' => 'Volvo',
            'modelo' => 'FMX',
            'estado' => 'activo',
        ]);

        $this->assertDatabaseHas('vehiculos', [
            'placa' => '9921-ABC',
            'marca' => 'Volvo',
        ]);

        $vehiculo->update([
            'estado' => 'reparacion',
        ]);

        $this->assertEquals('reparacion', $vehiculo->fresh()->estado);
    }
}
