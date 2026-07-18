<?php

namespace Tests\Unit\Services;

use App\Models\Bocamina;
use App\Models\Compra;
use App\Models\DetalleCompra;
use App\Models\Material;
use App\Models\Proveedor;
use App\Models\Rol;
use App\Models\User;
use App\Policies\CompraPolicy;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class CompraServiceTest extends TestCase
{
    use DatabaseTransactions;

    private $user;
    private $role;
    private $proveedor;
    private $bocamina;
    private $material;

    protected function setUp(): void
    {
        parent::setUp();

        $this->role = Rol::firstOrCreate(['nombre' => 'Compras']);
        $this->user = User::create([
            'nombre' => 'Test User Compras',
            'email' => 'comprastest@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $this->role->id,
            'estado' => true,
        ]);

        $this->proveedor = Proveedor::create([
            'nombre' => 'Proveedor S.A.',
            'nit' => '123456789',
            'telefono' => '77777777',
            'email' => 'proveedor@example.com',
        ]);

        $this->bocamina = Bocamina::create([
            'nombre' => 'Bocamina Central',
            'estado' => true,
        ]);

        $this->material = Material::create([
            'codigo' => 'MAT-TEST-001',
            'descripcion' => 'Pernos de anclaje',
            'grupo' => 'Soporte',
        ]);
    }

    /**
     * Test Happy Path: create a compra and compute details/totals correctly.
     */
    public function test_create_compra_happy_path(): void
    {
        $compra = Compra::create([
            'proveedor_id' => $this->proveedor->id,
            'usuario_id' => $this->user->id,
            'bocamina_id' => $this->bocamina->id,
            'fecha' => '2026-07-16',
            'numero_factura' => 'FAC-9921',
            'observaciones' => 'Test compra',
            'total' => 0,
        ]);

        $detalle1 = DetalleCompra::create([
            'compra_id' => $compra->id,
            'material_id' => $this->material->id,
            'cantidad' => 10,
            'precio' => 15.5,
            'subtotal' => 10 * 15.5,
        ]);

        $detalle2 = DetalleCompra::create([
            'compra_id' => $compra->id,
            'material_id' => $this->material->id,
            'cantidad' => 5,
            'precio' => 20.0,
            'subtotal' => 5 * 20.0,
        ]);

        $totalComputed = $detalle1->subtotal + $detalle2->subtotal;
        $compra->update(['total' => $totalComputed]);

        $this->assertDatabaseHas('compras', [
            'id' => $compra->id,
            'total' => 255.0,
        ]);

        $this->assertCount(2, $compra->detalles);
        $this->assertEquals($this->proveedor->id, $compra->proveedor->id);
        $this->assertEquals($this->bocamina->id, $compra->bocamina->id);
    }

    /**
     * Test Policy: CompraPolicy viewAny, view, create, update, delete.
     */
    public function test_compra_policy_authorizations(): void
    {
        $policy = new CompraPolicy();

        // Standard user can view list and single item
        $this->assertTrue($policy->viewAny($this->user));
        $compra = new Compra();
        $this->assertTrue($policy->view($this->user, $compra));

        // User with "Compras" role has access to create/update
        $this->assertTrue($policy->create($this->user));
        $this->assertTrue($policy->update($this->user, $compra));
        $this->assertTrue($policy->delete($this->user, $compra));

        // Create restricted user (Consulta)
        $restrictedRole = Rol::firstOrCreate(['nombre' => 'Consulta']);
        $restrictedUser = User::create([
            'nombre' => 'Consulta User',
            'email' => 'consulta@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $restrictedRole->id,
            'estado' => true,
        ]);

        $this->assertFalse($policy->create($restrictedUser));
        $this->assertFalse($policy->update($restrictedUser, $compra));
        $this->assertFalse($policy->delete($restrictedUser, $compra));
    }
}
