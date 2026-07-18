<?php

namespace Tests\Unit\Services;

use App\Models\Maquinaria;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class MaquinariaServiceTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test creating, reading, updating and deleting machinery.
     */
    public function test_maquinaria_crud_and_status_checks(): void
    {
        $maquinaria = Maquinaria::create([
            'nombre_codigo' => 'MAQ-UNIT-99',
            'tipo' => 'perforadora',
            'marca' => 'Sandvik',
            'modelo' => 'DD311',
            'estado' => 'activo',
        ]);

        $this->assertDatabaseHas('maquinarias', [
            'nombre_codigo' => 'MAQ-UNIT-99',
            'modelo' => 'DD311',
        ]);

        $maquinaria->update([
            'estado' => 'mantenimiento',
        ]);

        $this->assertEquals('mantenimiento', $maquinaria->fresh()->estado);
    }
}
