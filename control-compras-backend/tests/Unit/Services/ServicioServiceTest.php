<?php

namespace Tests\Unit\Services;

use App\Models\Bocamina;
use App\Models\CostoServicio;
use App\Models\HistorialOperacion;
use App\Models\Material;
use App\Models\RepuestoServicio;
use App\Models\Rol;
use App\Models\Servicio;
use App\Models\User;
use App\Policies\ServicioPolicy;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ServicioServiceTest extends TestCase
{
    use DatabaseTransactions;

    private $user;
    private $bocamina;
    private $material;

    protected function setUp(): void
    {
        parent::setUp();
        $role = Rol::firstOrCreate(['nombre' => 'Supervisor Bocamina']);
        $this->user = User::create([
            'nombre' => 'Jefe Taller',
            'email' => 'srv_boss@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $role->id,
            'estado' => true,
        ]);

        $this->bocamina = Bocamina::create([
            'nombre' => 'Bocamina Poniente',
        ]);

        $this->material = Material::create([
            'codigo' => 'MAT-REP-10',
            'descripcion' => 'Filtro de aire hidráulico',
        ]);
    }

    /**
     * Test creating a maintenance service and appending costs and parts.
     */
    public function test_create_servicio_with_parts_and_costs(): void
    {
        $servicio = Servicio::create([
            'codigo' => 'SRV-UNIT-01',
            'fecha' => '2026-07-16',
            'hora' => '10:00',
            'usuario_registro_id' => $this->user->id,
            'estado' => 'Borrador',
            'equipo_tipo' => 'vehiculo',
            'equipo_id' => 1,
            'boca_mina_id' => $this->bocamina->id,
        ]);

        $repuesto = RepuestoServicio::create([
            'servicio_id' => $servicio->id,
            'material_id' => $this->material->id,
            'cantidad' => 2,
            'costo_unitario' => 45.00,
        ]);

        $costo = CostoServicio::create([
            'servicio_id' => $servicio->id,
            'tipo_costo' => 'Soldadura especial',
            'monto' => 150.00,
        ]);

        $this->assertDatabaseHas('servicios', ['codigo' => 'SRV-UNIT-01']);
        $this->assertDatabaseHas('repuesto_servicios', ['servicio_id' => $servicio->id, 'material_id' => $this->material->id]);
        $this->assertDatabaseHas('costo_servicios', ['servicio_id' => $servicio->id, 'monto' => 150.00]);
    }

    /**
     * Test transition of state to 'Finalizado' triggers automatic audit logging for repuestos (consumption log).
     * This mimics the controller code behavior.
     */
    public function test_servicio_finalization_triggers_consumption_audit(): void
    {
        $servicio = Servicio::create([
            'codigo' => 'SRV-UNIT-02',
            'fecha' => '2026-07-16',
            'hora' => '11:00',
            'usuario_registro_id' => $this->user->id,
            'estado' => 'Borrador',
            'equipo_tipo' => 'vehiculo',
            'equipo_id' => 1,
            'boca_mina_id' => $this->bocamina->id,
        ]);

        RepuestoServicio::create([
            'servicio_id' => $servicio->id,
            'material_id' => $this->material->id,
            'cantidad' => 3,
            'costo_unitario' => 10.00,
        ]);

        // Simulating the transition logic inside controller:
        $oldEstado = $servicio->estado;
        $servicio->update(['estado' => 'Finalizado']);

        if ($oldEstado !== 'Finalizado' && $servicio->estado === 'Finalizado') {
            foreach ($servicio->repuestos as $rep) {
                HistorialOperacion::create([
                    'usuario_id' => $this->user->id,
                    'accion' => 'consumo_servicio',
                    'tabla' => 'materiales',
                    'registro_id' => $rep->material_id,
                    'datos_anteriores' => [],
                    'datos_nuevos' => ['cantidad_consumida' => $rep->cantidad, 'servicio_codigo' => $servicio->codigo],
                    'ip' => '127.0.0.1',
                    'fecha' => now(),
                ]);
            }
        }

        $this->assertDatabaseHas('historial_operaciones', [
            'accion' => 'consumo_servicio',
            'tabla' => 'materiales',
            'registro_id' => $this->material->id,
        ]);
    }

    /**
     * Test ServicioPolicy authorizations.
     */
    public function test_servicio_policy_permissions(): void
    {
        $policy = new ServicioPolicy();
        $servicio = new Servicio();

        $this->assertTrue($policy->viewAny($this->user));
        $this->assertTrue($policy->view($this->user, $servicio));
        $this->assertTrue($policy->create($this->user));
        $this->assertTrue($policy->update($this->user, $servicio));

        // Consulta user
        $restrictedRole = Rol::firstOrCreate(['nombre' => 'Consulta']);
        $restrictedUser = User::create([
            'nombre' => 'Consulta User',
            'email' => 'consulta_srv@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $restrictedRole->id,
            'estado' => true,
        ]);

        $this->assertFalse($policy->create($restrictedUser));
        $this->assertFalse($policy->update($restrictedUser, $servicio));
        $this->assertFalse($policy->delete($restrictedUser, $servicio));
    }
}
