<?php

namespace Tests\Unit\Services;

use App\Models\Material;
use App\Models\Rol;
use App\Models\User;
use App\Policies\MaterialPolicy;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MaterialServiceTest extends TestCase
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
            'email' => 'mat_test@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $this->role->id,
            'estado' => true,
        ]);
    }

    /**
     * Test Happy Path: create, update, and de-activate (logical delete) a material.
     */
    public function test_material_crud_and_status(): void
    {
        $material = Material::create([
            'codigo' => 'MAT-ROCK-12',
            'descripcion' => 'Brocas de perforación neumática',
            'grupo' => 'Perforación',
            'estado' => 'activo',
        ]);

        $this->assertDatabaseHas('materiales', [
            'codigo' => 'MAT-ROCK-12',
            'estado' => 'activo',
        ]);

        // Update details
        $material->update([
            'descripcion' => 'Brocas neumáticas de 12 pulgadas',
        ]);
        $this->assertEquals('Brocas neumáticas de 12 pulgadas', $material->fresh()->descripcion);

        // Physical delete
        $materialId = $material->id;
        $material->delete();

        $this->assertDatabaseMissing('materiales', ['id' => $materialId]);
    }

    /**
     * Test Material Image upload.
     */
    public function test_material_image_upload(): void
    {
        Storage::fake('public');

        $material = Material::create([
            'codigo' => 'MAT-IMG-01',
            'descripcion' => 'Prueba Imagen',
            'estado' => 'activo',
        ]);

        $file = UploadedFile::fake()->image('drill.jpg');
        $path = $file->store('materiales', 'public');
        $material->update(['imagen' => $path]);

        $this->assertEquals($path, $material->getRawOriginal('imagen'));
        Storage::disk('public')->assertExists($path);
    }

    /**
     * Test Policy for Material.
     */
    public function test_material_policy(): void
    {
        $policy = new MaterialPolicy();
        $material = new Material();

        $this->assertTrue($policy->viewAny($this->user));
        $this->assertTrue($policy->view($this->user, $material));
        $this->assertTrue($policy->create($this->user));
        $this->assertTrue($policy->update($this->user, $material));
        $this->assertTrue($policy->delete($this->user, $material));

        // Consulta user
        $restrictedRole = Rol::firstOrCreate(['nombre' => 'Consulta']);
        $restrictedUser = User::create([
            'nombre' => 'Consulta User',
            'email' => 'consulta_mat@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $restrictedRole->id,
            'estado' => true,
        ]);

        $this->assertFalse($policy->create($restrictedUser));
        $this->assertFalse($policy->update($restrictedUser, $material));
        $this->assertFalse($policy->delete($restrictedUser, $material));
    }
}
