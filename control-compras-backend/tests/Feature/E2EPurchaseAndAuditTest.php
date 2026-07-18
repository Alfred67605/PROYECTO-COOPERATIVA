<?php

namespace Tests\Feature;

use App\Models\Bocamina;
use App\Models\Compra;
use App\Models\HistorialOperacion;
use App\Models\Material;
use App\Models\Proveedor;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class E2EPurchaseAndAuditTest extends TestCase
{
    use DatabaseTransactions;

    private $buyer;
    private $admin;
    private $proveedor;
    private $bocamina;
    private $material;

    protected function setUp(): void
    {
        parent::setUp();

        $roleCompras = Rol::firstOrCreate(['nombre' => 'Compras']);
        $roleAdmin = Rol::firstOrCreate(['nombre' => 'Administrador General']);

        $this->buyer = User::create([
            'nombre' => 'Comprador Oficial',
            'email' => 'compras_e2e@example.com',
            'password' => bcrypt('password123!'),
            'rol_id' => $roleCompras->id,
            'estado' => true,
        ]);

        $this->admin = User::create([
            'nombre' => 'Administrador E2E',
            'email' => 'admin_e2e@example.com',
            'password' => bcrypt('password123!'),
            'rol_id' => $roleAdmin->id,
            'estado' => true,
        ]);

        $this->proveedor = Proveedor::create([
            'nombre' => 'Proveedor E2E S.A.',
            'nit' => '999888777',
        ]);

        $this->bocamina = Bocamina::create([
            'nombre' => 'Bocamina E2E',
            'estado' => true,
        ]);

        $this->material = Material::create([
            'codigo' => 'MAT-E2E-01',
            'descripcion' => 'Cable Eléctrico Blindado',
        ]);
    }

    /**
     * E2E Flow: Login -> Create Purchase -> Create Details -> Audit Log -> Query Purchase -> Policy Check.
     */
    public function test_complete_purchase_and_audit_log_flow(): void
    {
        // 1. Simular Login
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'compras_e2e@example.com',
            'password' => 'password123!',
        ]);

        $loginResponse->assertStatus(200);

        // Autenticar por Sanctum para peticiones API subsecuentes
        Sanctum::actingAs($this->buyer);

        // 2. Crear Compra con Detalles (Simula "Crear Compra" y "Crear Detalle")
        $compraResponse = $this->postJson('/api/compras', [
            'proveedor_id' => $this->proveedor->id,
            'bocamina_id' => $this->bocamina->id,
            'fecha' => '2026-07-16',
            'numero_factura' => 'FACT-E2E-999',
            'observaciones' => 'Compra generada en flujo E2E',
            'detalles' => [
                [
                    'material_id' => $this->material->id,
                    'cantidad' => 15.00,
                    'precio' => 120.00, // Total = 1800.00
                ]
            ]
        ]);

        $compraResponse->assertStatus(201);
        $compraId = $compraResponse->json('id');

        // 3. Verificar que se guardó en la Base de Datos
        $this->assertDatabaseHas('compras', [
            'id' => $compraId,
            'total' => 1800.00,
        ]);

        $this->assertDatabaseHas('detalle_compras', [
            'compra_id' => $compraId,
            'material_id' => $this->material->id,
            'cantidad' => 15.00,
            'subtotal' => 1800.00,
        ]);

        // 4. Verificar que el middleware 'audit' guardó la operación en historial_operaciones
        // Se ejecuta después de responder a la petición mediante terminate()
        $this->assertDatabaseHas('historial_operaciones', [
            'usuario_id' => $this->buyer->id,
            'accion' => 'crear',
            'tabla' => 'compras',
            'registro_id' => $compraId,
        ]);

        // 5. Consultar Compra
        $this->getJson("/api/compras/{$compraId}")
             ->assertStatus(200)
             ->assertJson([
                 'id' => $compraId,
                 'total' => 1800.00,
             ]);

        // 6. Intentar actualización (las compras son registros contables históricos inalterables)
        // El controlador no implementa PUT/DELETE. Verificamos que no se permita modificar registros históricos.
        $this->putJson("/api/compras/{$compraId}", [
            'total' => 2000.00,
        ])->assertStatus(500); // BadMethodCallException since update doesn't exist

        // 7. Simular Logout
        $this->postJson('/api/logout')
             ->assertStatus(200)
             ->assertJson(['message' => 'Sesión cerrada correctamente']);
    }
}
