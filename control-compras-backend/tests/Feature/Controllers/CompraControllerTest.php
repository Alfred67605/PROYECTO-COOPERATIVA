<?php

namespace Tests\Feature\Controllers;

use App\Models\Bocamina;
use App\Models\Material;
use App\Models\Proveedor;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompraControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $user;
    private $proveedor;
    private $bocamina;
    private $material;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Rol::firstOrCreate(['nombre' => 'Compras']);
        $this->user = User::create([
            'nombre' => 'Purchaser',
            'email' => 'purchaser_ctrl@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $role->id,
            'estado' => true,
        ]);

        $this->proveedor = Proveedor::create([
            'nombre' => 'Metalmecanica Limitada',
            'nit' => '444111222',
        ]);

        $this->bocamina = Bocamina::create([
            'nombre' => 'Frente Norte',
            'estado' => true,
        ]);

        $this->material = Material::create([
            'codigo' => 'MAT-PERN-10',
            'descripcion' => 'Pernos de acero',
        ]);
    }

    /**
     * Test index listing of compras with pagination.
     */
    public function test_list_compras_with_pagination(): void
    {
        Sanctum::actingAs($this->user);
        $response = $this->getJson('/api/compras');
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data',
                     'current_page',
                     'last_page',
                     'total',
                 ]);
    }

    /**
     * Test storing a purchase order successfully (Happy Path).
     */
    public function test_store_purchase_order(): void
    {
        Sanctum::actingAs($this->user);
        $response = $this->postJson('/api/compras', [
            'proveedor_id' => $this->proveedor->id,
            'bocamina_id' => $this->bocamina->id,
            'fecha' => '2026-07-16',
            'numero_factura' => 'FACT-10029',
            'observaciones' => 'Prueba de integración compras',
            'detalles' => [
                [
                    'material_id' => $this->material->id,
                    'cantidad' => 100,
                    'precio' => 2.50,
                ],
                [
                    'material_id' => $this->material->id,
                    'cantidad' => 20,
                    'precio' => 10.00,
                ]
            ]
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'id',
                     'total',
                     'detalles' => [
                         '*' => [
                             'id',
                             'compra_id',
                             'material_id',
                             'cantidad',
                             'precio',
                             'subtotal',
                         ]
                     ]
                 ])
                 ->assertJson([
                     'total' => 450.00, // (100 * 2.5) + (20 * 10) = 250 + 200 = 450
                 ]);

        $this->assertDatabaseHas('compras', [
            'id' => $response->json('id'),
            'total' => 450.00,
        ]);
    }

    /**
     * Test storing a purchase with validation failures.
     */
    public function test_store_purchase_validation_failures(): void
    {
        Sanctum::actingAs($this->user);
        $response = $this->postJson('/api/compras', [
            'proveedor_id' => '', // Inexistente
            'bocamina_id' => 9999, // Inexistente
            'fecha' => 'invalid-date',
            'detalles' => [] // Empty
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['proveedor_id', 'bocamina_id', 'fecha', 'numero_factura', 'detalles']);
    }
}
