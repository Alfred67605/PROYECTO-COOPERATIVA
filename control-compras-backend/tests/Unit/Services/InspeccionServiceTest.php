<?php

namespace Tests\Unit\Services;

use App\Models\Inspeccion;
use App\Models\Maquinaria;
use App\Models\Rol;
use App\Models\User;
use App\Policies\InspeccionPolicy;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class InspeccionServiceTest extends TestCase
{
    use DatabaseTransactions;

    private $user;
    private $role;
    private $maquinaria;

    protected function setUp(): void
    {
        parent::setUp();
        $this->role = Rol::firstOrCreate(['nombre' => 'Supervisor Bocamina']);
        $this->user = User::create([
            'nombre' => 'Inspector Técnico',
            'email' => 'inspector@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $this->role->id,
            'estado' => true,
        ]);

        $this->maquinaria = Maquinaria::create([
            'nombre_codigo' => 'MAQ-INSP-01',
            'tipo' => 'cargador',
            'estado' => 'activo',
        ]);
    }

    /**
     * Test creating an inspection report.
     */
    public function test_create_inspeccion_and_checklist(): void
    {
        $inspeccion = Inspeccion::create([
            'firma_responsable_id' => $this->user->id,
            'equipo_tipo' => 'maquinaria',
            'equipo_id' => $this->maquinaria->id,
            'motor_ok' => true,
            'frenos_ok' => true,
            'aceite_ok' => true,
            'neumaticos_ok' => true,
            'luces_ok' => true,
            'seguridad_ok' => true,
            'observaciones' => 'Listo para ingreso a mina',
        ]);

        $this->assertDatabaseHas('inspeccions', [
            'id' => $inspeccion->id,
            'motor_ok' => true,
        ]);

        $this->assertEquals($this->maquinaria->id, $inspeccion->equipo_id);
    }

    /**
     * Test InspeccionPolicy permissions.
     */
    public function test_inspeccion_policy_checks(): void
    {
        $policy = new InspeccionPolicy();
        $inspeccion = new Inspeccion();
        $inspeccion->firma_responsable_id = $this->user->id;

        // Supervisor Bocamina has default access to servicios/inspecciones
        $this->assertTrue($policy->viewAny($this->user));
        $this->assertTrue($policy->view($this->user, $inspeccion));
        $this->assertTrue($policy->create($this->user));
        $this->assertTrue($policy->update($this->user, $inspeccion));

        // Consulta user (restricted)
        $restrictedRole = Rol::firstOrCreate(['nombre' => 'Consulta']);
        $restrictedUser = User::create([
            'nombre' => 'Consulta User',
            'email' => 'consulta_insp@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $restrictedRole->id,
            'estado' => true,
        ]);

        // Any authenticated user can create inspection
        $this->assertTrue($policy->create($restrictedUser));

        // restrictedUser cannot delete (requires services write access)
        $this->assertFalse($policy->delete($restrictedUser, $inspeccion));
    }
}
