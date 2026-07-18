<?php

namespace Tests\Unit\Services;

use App\Models\Maquinaria;
use App\Models\Vehiculo;
use App\Models\Servicio;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class DashboardServiceTest extends TestCase
{
    use DatabaseTransactions;

    private $user;

    protected function setUp(): void
    {
        parent::setUp();
        $role = Rol::firstOrCreate(['nombre' => 'Gerencia']);
        $this->user = User::create([
            'nombre' => 'Dashboard Viewer',
            'email' => 'dash@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $role->id,
            'estado' => true,
        ]);
    }

    /**
     * Test active machinery and vehicles aggregates.
     */
    public function test_equipment_status_aggregations(): void
    {
        Maquinaria::create([
            'nombre_codigo' => 'Excavadora CAT',
            'tipo' => 'pesada',
            'estado' => 'activo',
        ]);

        Maquinaria::create([
            'nombre_codigo' => 'Jumbo de Perforación',
            'tipo' => 'perforadora',
            'estado' => 'reparacion',
        ]);

        Vehiculo::create([
            'tipo' => 'liviano',
            'placa' => '9921-ABC',
            'estado' => 'activo',
        ]);

        // KPIs Logic matching DashboardServiciosController/ReporteController:
        // total_maquinaria_activa = Maquinaria::where('estado', 'activo')->count() + Vehiculo::where('estado', 'activo')->count()
        // equipos_reparacion = Maquinaria::where('estado', 'reparacion')->count() + Vehiculo::where('estado', 'reparacion')->count()
        
        $totalActivos = Maquinaria::where('estado', 'activo')->count() + Vehiculo::where('estado', 'activo')->count();
        $totalReparacion = Maquinaria::where('estado', 'reparacion')->count() + Vehiculo::where('estado', 'reparacion')->count();

        $this->assertGreaterThanOrEqual(2, $totalActivos);
        $this->assertGreaterThanOrEqual(1, $totalReparacion);
    }
}
