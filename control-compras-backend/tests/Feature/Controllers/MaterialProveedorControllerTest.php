<?php

namespace Tests\Feature\Controllers;

use App\Models\Material;
use App\Models\Proveedor;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MaterialProveedorControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $user;
    private $restrictedUser;

    protected function setUp(): void
    {
        parent::setUp();

        $roleCompras = Rol::firstOrCreate(['nombre' => 'Compras']);
        $roleConsulta = Rol::firstOrCreate(['nombre' => 'Consulta']);

        $this->user = User::create([
            'nombre' => 'Compras User',
            'email' => 'compras_ctrl_test@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $roleCompras->id,
            'estado' => true,
        ]);

        $this->restrictedUser = User::create([
            'nombre' => 'Consulta User',
            'email' => 'consulta_ctrl_test@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $roleConsulta->id,
            'estado' => true,
        ]);
    }

    /**
     * Test Material CRUD operations & policies.
     */
    public function test_material_crud_and_image_upload_endpoints(): void
    {
        // 1. Creation blocked by policy for Consulta
        Sanctum::actingAs($this->restrictedUser);
        $this->postJson('/api/materiales', [
                 'codigo' => 'MAT-FAIL',
                 'descripcion' => 'Should Fail',
             ])
             ->assertStatus(403);

        // 2. Creation successful for Compras role
        Sanctum::actingAs($this->user);
        $response = $this->postJson('/api/materiales', [
                 'codigo' => 'MAT-SUCCESS-99',
                 'descripcion' => 'Filtro Carbón Atómico',
                 'grupo' => 'Filtros',
             ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['id', 'codigo', 'descripcion']);

        $materialId = $response->json('id');

        // 3. Upload image
        Storage::fake('public');
        $file = UploadedFile::fake()->image('filtro.png');

        $this->postJson("/api/materiales/{$materialId}/imagen", [
                 'imagen' => $file,
             ])
             ->assertStatus(200)
             ->assertJsonStructure(['message', 'path']);

        $this->assertNotNull(Material::find($materialId)->getRawOriginal('imagen'));

        // 4. Delete image
        $this->deleteJson("/api/materiales/{$materialId}/imagen")
             ->assertStatus(200);

        $this->assertNull(Material::find($materialId)->getRawOriginal('imagen'));
    }

    /**
     * Test Proveedor CRUD operations & policies.
     */
    public function test_proveedor_crud_and_logo_upload_endpoints(): void
    {
        Sanctum::actingAs($this->user);

        // 1. Create Proveedor
        $response = $this->postJson('/api/proveedores', [
                 'nombre' => 'ACME Mining S.A.',
                 'nit' => '888777666',
                 'telefono' => '12345678',
                 'email' => 'acme@example.com',
             ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['id', 'nombre', 'nit']);

        $proveedorId = $response->json('id');

        // 2. Upload logo
        Storage::fake('public');
        $logo = UploadedFile::fake()->image('logo.jpg');

        $this->postJson("/api/proveedores/{$proveedorId}/logo", [
                 'logo' => $logo,
             ])
             ->assertStatus(200)
             ->assertJsonStructure(['id', 'nombre', 'logo']); // Returns Proveedor model

        $this->assertNotNull(Proveedor::find($proveedorId)->logo);

        // 3. Delete logo
        $this->deleteJson("/api/proveedores/{$proveedorId}/logo")
             ->assertStatus(200);

        $this->assertNull(Proveedor::find($proveedorId)->logo);
    }
}
