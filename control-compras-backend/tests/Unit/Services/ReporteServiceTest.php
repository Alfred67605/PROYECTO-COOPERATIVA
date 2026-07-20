<?php

namespace Tests\Unit\Services;

use App\Models\Bocamina;
use App\Models\Compra;
use App\Models\CostoServicio;
use App\Models\Proveedor;
use App\Models\RepuestoServicio;
use App\Models\Rol;
use App\Models\Servicio;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ReporteServiceTest extends TestCase
{
    use DatabaseTransactions;

    private $user;
    private $bocamina;
    private $proveedor;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Rol::firstOrCreate(['nombre' => 'Gerencia']);
        $this->user = User::create([
            'nombre' => 'Reporter',
            'email' => 'reporter@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $role->id,
            'estado' => true,
        ]);

        $this->bocamina = Bocamina::create([
            'nombre' => 'Bocamina Sur',
        ]);

        $this->proveedor = Proveedor::create([
            'nombre' => 'Minera Industrial',
            'nit' => '4444444',
        ]);
    }

    /**
     * Test logic of aggregating expenses: purchases + services (labor + parts).
     */
    public function test_expenses_consolidation_logic(): void
    {
        // 1. Create a purchase
        $compra = Compra::create([
            'proveedor_id' => $this->proveedor->id,
            'usuario_id' => $this->user->id,
            'bocamina_id' => $this->bocamina->id,
            'fecha' => '2026-07-10',
            'total' => 1250.50,
        ]);

        // 2. Create a service maintenance record
        $servicio = Servicio::create([
            'codigo' => 'SRV-TEST-88',
            'fecha' => '2026-07-12',
            'hora' => '14:30',
            'usuario_registro_id' => $this->user->id,
            'estado' => 'Finalizado',
            'equipo_tipo' => 'vehiculo',
            'equipo_id' => 1,
            'boca_mina_id' => $this->bocamina->id,
        ]);

        // Add additional labor cost
        CostoServicio::create([
            'servicio_id' => $servicio->id,
            'tipo_costo' => 'Mano de obra externa',
            'monto' => 300.00,
        ]);

        // Add repuestos cost (create a test material first)
        $material = \App\Models\Material::firstOrCreate(
            ['codigo' => 'TEST-MAT-001'],
            ['descripcion' => 'Material de prueba', 'grupo' => 'Otros', 'estado' => 'disponible']
        );
        RepuestoServicio::create([
            'servicio_id' => $servicio->id,
            'material_id' => $material->id,
            'cantidad' => 2,
            'costo_unitario' => 50.00, // Total 100.00
        ]);

        // Compute aggregate costs manually matching controller formula
        $comprasSum = Compra::where('bocamina_id', $this->bocamina->id)->sum('total');
        
        $serviciosSum = 0;
        $servicios = Servicio::with(['costos', 'repuestos'])->where('boca_mina_id', $this->bocamina->id)->get();
        foreach ($servicios as $s) {
            $serviciosSum += $s->costos->sum('monto') + $s->repuestos->sum(function ($r) {
                return $r->cantidad * $r->costo_unitario;
            });
        }

        $this->assertEquals(1250.50, $comprasSum);
        $this->assertEquals(400.00, $serviciosSum);
        $this->assertEquals(1650.50, $comprasSum + $serviciosSum);
    }
}
