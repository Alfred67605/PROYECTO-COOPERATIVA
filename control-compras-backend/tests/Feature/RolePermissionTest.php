<?php

namespace Tests\Feature;

use App\Models\Permiso;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use DatabaseTransactions;

    private $roles = [];
    private $permisos = [];

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles
        $roleNames = [
            'Administrador General',
            'Gerencia',
            'Compras',
            'Supervisor Bocamina',
            'Contabilidad',
            'Consulta'
        ];

        foreach ($roleNames as $name) {
            $this->roles[$name] = Rol::firstOrCreate(['nombre' => $name]);
        }

        // Seed permissions
        $permNames = [
            'dashboard',
            'bocaminas',
            'proveedores',
            'materiales',
            'compras',
            'servicios',
            'reportes',
            'auditoria',
            'solo_lectura'
        ];

        foreach ($permNames as $name) {
            $this->permisos[$name] = Permiso::firstOrCreate(
                ['nombre' => $name],
                ['descripcion' => "Test permission $name"]
            );
        }
    }

    private function createUser($roleName, $permissions = [])
    {
        $unique = uniqid();
        $user = User::create([
            'nombre' => "Test $roleName $unique",
            'email' => strtolower(str_replace(' ', '', $roleName)) . "_" . $unique . "@example.com",
            'password' => bcrypt('password'),
            'rol_id' => $this->roles[$roleName]->id,
            'estado' => true,
        ]);

        if (!empty($permissions)) {
            $permIds = [];
            foreach ($permissions as $pName) {
                if (isset($this->permisos[$pName])) {
                    $permIds[] = $this->permisos[$pName]->id;
                }
            }
            $user->permisos()->sync($permIds);
        }

        return $user;
    }

    public function test_historial_route_permissions(): void
    {
        // Route is protected by role:Administrador General,Gerencia,auditoria

        // 1. Admin General user (should pass)
        $admin = $this->createUser('Administrador General');
        Sanctum::actingAs($admin);
        $response = $this->getJson('/api/historial');
        $response->assertStatus(200);

        // 2. Gerencia user (should pass)
        $gerencia = $this->createUser('Gerencia');
        Sanctum::actingAs($gerencia);
        $response = $this->getJson('/api/historial');
        $response->assertStatus(200);

        // 3. Consulta user (should pass, because auditoria is in defaults)
        $consulta = $this->createUser('Consulta');
        Sanctum::actingAs($consulta);
        $response = $this->getJson('/api/historial');
        $response->assertStatus(200);

        // 4. Compras user (should fail, no default auditoria)
        $compras = $this->createUser('Compras');
        Sanctum::actingAs($compras);
        $response = $this->getJson('/api/historial');
        $response->assertStatus(403);

        // 5. Compras user with explicit 'auditoria' permission (should pass)
        $comprasWithPerm = $this->createUser('Compras', ['auditoria']);
        Sanctum::actingAs($comprasWithPerm);
        $response = $this->getJson('/api/historial');
        $response->assertStatus(200);
    }

    public function test_reportes_dashboard_route_permissions(): void
    {
        // Route is protected by role:Administrador General,dashboard

        // 1. Admin General user (should pass)
        $admin = $this->createUser('Administrador General');
        Sanctum::actingAs($admin);
        $response = $this->getJson('/api/reportes/dashboard');
        $response->assertStatus(200);

        // 2. Gerencia user without dashboard permission (should fail)
        $gerencia = $this->createUser('Gerencia');
        Sanctum::actingAs($gerencia);
        $response = $this->getJson('/api/reportes/dashboard');
        $response->assertStatus(403);

        // 3. Contabilidad user without dashboard permission (should fail)
        $contabilidad = $this->createUser('Contabilidad');
        Sanctum::actingAs($contabilidad);
        $response = $this->getJson('/api/reportes/dashboard');
        $response->assertStatus(403);

        // 4. Non-admin user with explicit 'dashboard' permission (should pass)
        $userWithPerm = $this->createUser('Gerencia', ['dashboard']);
        Sanctum::actingAs($userWithPerm);
        $response = $this->getJson('/api/reportes/dashboard');
        $response->assertStatus(200);
    }
}
