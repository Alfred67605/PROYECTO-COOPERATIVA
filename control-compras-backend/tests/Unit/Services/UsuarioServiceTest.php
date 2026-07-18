<?php

namespace Tests\Unit\Services;

use App\Models\Permiso;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class UsuarioServiceTest extends TestCase
{
    use DatabaseTransactions;

    private $adminRole;
    private $comprasRole;
    private $consultaRole;

    protected function setUp(): void
    {
        parent::setUp();
        $this->adminRole = Rol::firstOrCreate(['nombre' => 'Administrador General']);
        $this->comprasRole = Rol::firstOrCreate(['nombre' => 'Compras']);
        $this->consultaRole = Rol::firstOrCreate(['nombre' => 'Consulta']);
    }

    /**
     * Test user creation, role assignment, and state changes.
     */
    public function test_user_properties_and_state(): void
    {
        $user = User::create([
            'nombre' => 'Ing. Juan Perez',
            'email' => 'juanperez@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $this->comprasRole->id,
            'estado' => true,
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'juanperez@example.com',
            'estado' => true,
        ]);

        // Toggle state to inactive
        $user->update(['estado' => false]);
        $this->assertFalse($user->fresh()->estado);
    }

    /**
     * Test RBAC permissions and default roles mappings.
     */
    public function test_rbac_permissions_evaluation(): void
    {
        // 1. Admin General has total authorization
        $adminUser = User::create([
            'nombre' => 'Admin User',
            'email' => 'admin_test_user@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $this->adminRole->id,
            'estado' => true,
        ]);

        $this->assertTrue($adminUser->canAccess('inventario'));
        $this->assertTrue($adminUser->canAccess('compras'));
        $this->assertTrue($adminUser->canAccess('usuarios'));
        $this->assertTrue($adminUser->canWrite('inventario'));

        // 2. Compras Role has default access to proveedores, materiales, compras
        $comprasUser = User::create([
            'nombre' => 'Compras User',
            'email' => 'compras_test_user@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $this->comprasRole->id,
            'estado' => true,
        ]);

        $this->assertTrue($comprasUser->canAccess('materiales'));
        $this->assertTrue($comprasUser->canAccess('compras'));
        $this->assertFalse($comprasUser->canAccess('usuarios'));
        
        $this->assertTrue($comprasUser->canWrite('compras'));
        $this->assertFalse($comprasUser->canWrite('usuarios'));

        // 3. Consulta Role has default access to reportes, auditoria, but can never write.
        $consultaUser = User::create([
            'nombre' => 'Consulta User',
            'email' => 'consulta_test_user@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $this->consultaRole->id,
            'estado' => true,
        ]);

        $this->assertTrue($consultaUser->canAccess('reportes'));
        $this->assertFalse($consultaUser->canAccess('compras'));
        
        $this->assertFalse($consultaUser->canWrite('reportes')); // Read-only role

        // 4. Inactive user loses all privileges
        $comprasUser->update(['estado' => false]);
        $this->assertFalse($comprasUser->canAccess('compras'));
        $this->assertFalse($comprasUser->canWrite('compras'));
    }

    /**
     * Test explicit user permissions override default roles.
     */
    public function test_user_explicit_permissions(): void
    {
        $user = User::create([
            'nombre' => 'Custom User',
            'email' => 'custom@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $this->consultaRole->id,
            'estado' => true,
        ]);

        // Consulta user doesn't have materials permission by default
        $this->assertFalse($user->canAccess('materiales'));

        $permiso = Permiso::firstOrCreate(['nombre' => 'materiales'], ['descripcion' => 'Permiso a materiales']);
        $user->permisos()->sync([$permiso->id]);

        $this->assertTrue($user->fresh()->hasPermission('materiales'));
        $this->assertTrue($user->fresh()->canAccess('materiales'));
    }
}
