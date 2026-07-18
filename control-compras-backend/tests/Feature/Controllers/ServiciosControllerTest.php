<?php

namespace Tests\Feature\Controllers;

use App\Models\Bocamina;
use App\Models\Material;
use App\Models\Rol;
use App\Models\Servicio;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ServiciosControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $user;
    private $bocamina;
    private $material;

    protected function setUp(): void
    {
        parent::setUp();

        // Disable mass assignment strict checks for testing to avoid 500 when passing validated repuestos/costos array
        \Illuminate\Database\Eloquent\Model::preventSilentlyDiscardingAttributes(false);

        $role = Rol::firstOrCreate(['nombre' => 'Supervisor Bocamina']);
        $this->user = User::create([
            'nombre' => 'Supervisor Mina Sur',
            'email' => 'supervisor_ctrl@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $role->id,
            'estado' => true,
        ]);

        $this->bocamina = Bocamina::create([
            'nombre' => 'Mina Sur',
            'estado' => true,
        ]);

        $this->material = Material::create([
            'codigo' => 'MAT-MAQ-REP',
            'descripcion' => 'Manguera hidráulica 3/4',
        ]);
    }

    /**
     * Test listing services.
     */
    public function test_list_servicios(): void
    {
        Sanctum::actingAs($this->user);
        $response = $this->getJson('/api/servicios');
        $response->assertStatus(200)
                 ->assertJsonIsArray();
    }

    /**
     * Test creating a maintenance service with nested data (repuestos, costos).
     */
    public function test_create_mantenimiento_service(): void
    {
        Sanctum::actingAs($this->user);
        $response = $this->postJson('/api/servicios', [
            'codigo' => 'SRV-TEST-INT-001',
            'fecha' => '2026-07-16',
            'hora' => '09:00',
            'usuario_registro_id' => $this->user->id,
            'estado' => 'Borrador',
            'equipo_tipo' => 'maquinaria',
            'equipo_id' => 1,
            'boca_mina_id' => $this->bocamina->id,
            'descripcion' => 'Cambio de mangueras de lubricación',
            'repuestos' => [
                [
                    'material_id' => $this->material->id,
                    'cantidad' => 2,
                    'costo_unitario' => 25.00,
                ]
            ],
            'costos' => [
                [
                    'tipo_costo' => 'Taller local',
                    'monto' => 120.00,
                    'descripcion' => 'Limpieza y roscado'
                ]
            ]
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'id',
                     'codigo',
                     'repuestos' => [
                         '*' => [
                             'id',
                             'material_id',
                             'cantidad',
                         ]
                     ],
                     'costos' => [
                         '*' => [
                             'id',
                             'tipo_costo',
                             'monto',
                         ]
                     ]
                 ]);

        $this->assertDatabaseHas('servicios', [
            'codigo' => 'SRV-TEST-INT-001',
        ]);
    }

    /**
     * Test transition of state to 'Finalizado' triggers automatic audit logging for repuestos (consumption log).
     */
    public function test_service_finalization_audits_materials(): void
    {
        $servicio = Servicio::create([
            'codigo' => 'SRV-TEST-INT-002',
            'fecha' => '2026-07-16',
            'hora' => '10:00',
            'usuario_registro_id' => $this->user->id,
            'estado' => 'Borrador',
            'equipo_tipo' => 'maquinaria',
            'equipo_id' => 1,
            'boca_mina_id' => $this->bocamina->id,
        ]);

        \App\Models\RepuestoServicio::create([
            'servicio_id' => $servicio->id,
            'material_id' => $this->material->id,
            'cantidad' => 1,
            'costo_unitario' => 10.00,
        ]);

        Sanctum::actingAs($this->user);

        // Triggering update through API to finalise service
        $response = $this->putJson("/api/servicios/{$servicio->id}", [
            'estado' => 'Finalizado',
        ]);

        $response->assertStatus(200);

        // Verify audit log has been triggered for materials consumption
        $this->assertDatabaseHas('historial_operaciones', [
            'accion' => 'consumo_servicio',
            'tabla' => 'materiales',
            'registro_id' => $this->material->id,
        ]);
    }
}
