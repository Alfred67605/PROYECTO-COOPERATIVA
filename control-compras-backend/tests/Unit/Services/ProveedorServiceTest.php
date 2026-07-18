<?php

namespace Tests\Unit\Services;

use App\Models\Proveedor;
use App\Models\Rol;
use App\Models\User;
use App\Policies\ProveedorPolicy;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProveedorServiceTest extends TestCase
{
    use DatabaseTransactions;

    private $user;
    private $role;

    protected function setUp(): void
    {
        parent::setUp();
        $this->role = Rol::firstOrCreate(['nombre' => 'Compras']);
        $this->user = User::create([
            'nombre' => 'Test User',
            'email' => 'prov_test@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $this->role->id,
            'estado' => true,
        ]);
    }

    /**
     * Test Happy Path: create, retrieve, update and delete a proveedor.
     */
    public function test_proveedor_crud_operations(): void
    {
        $proveedor = Proveedor::create([
            'nombre' => 'ACME Mining Supplies',
            'nit' => '9988776655',
            'telefono' => '60000000',
            'email' => 'contact@acme.com',
            'logo' => null,
        ]);

        $this->assertDatabaseHas('proveedores', [
            'nombre' => 'ACME Mining Supplies',
            'nit' => '9988776655',
        ]);

        $proveedor->update([
            'telefono' => '61111111',
        ]);

        $this->assertEquals('61111111', $proveedor->fresh()->telefono);

        $proveedor->delete();
        $this->assertDatabaseMissing('proveedores', [
            'id' => $proveedor->id,
        ]);
    }

    /**
     * Test uploading a logo to a proveedor using mock storage.
     */
    public function test_proveedor_logo_upload(): void
    {
        Storage::fake('public');

        $proveedor = Proveedor::create([
            'nombre' => 'Logo Test Proveedor',
            'nit' => '1122334455',
        ]);

        $file = UploadedFile::fake()->image('logo.png');
        $path = $file->store('logos', 'public');
        $proveedor->update(['logo' => $path]);

        $this->assertEquals($path, $proveedor->logo);
        Storage::disk('public')->assertExists($path);
    }

    /**
     * Test policies of Proveedor.
     */
    public function test_proveedor_policy(): void
    {
        $policy = new ProveedorPolicy();
        $proveedor = new Proveedor();

        $this->assertTrue($policy->viewAny($this->user));
        $this->assertTrue($policy->view($this->user, $proveedor));
        $this->assertTrue($policy->create($this->user));
        $this->assertTrue($policy->update($this->user, $proveedor));
        $this->assertTrue($policy->delete($this->user, $proveedor));

        // Create restricted user (Consulta)
        $restrictedRole = Rol::firstOrCreate(['nombre' => 'Consulta']);
        $restrictedUser = User::create([
            'nombre' => 'Consulta User',
            'email' => 'consulta_prov@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $restrictedRole->id,
            'estado' => true,
        ]);

        $this->assertFalse($policy->create($restrictedUser));
        $this->assertFalse($policy->update($restrictedUser, $proveedor));
        $this->assertFalse($policy->delete($restrictedUser, $proveedor));
    }
}
