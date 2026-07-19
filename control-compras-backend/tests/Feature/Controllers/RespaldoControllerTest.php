<?php

namespace Tests\Feature\Controllers;

use App\Models\Respaldo;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RespaldoControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $adminUser;
    private $comprasUser;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRol = Rol::firstOrCreate(['nombre' => 'Administrador General']);
        $comprasRol = Rol::firstOrCreate(['nombre' => 'Compras']);

        $this->adminUser = User::create([
            'nombre' => 'Admin Test',
            'email' => 'admintest@cooperativa.com',
            'password' => bcrypt('password'),
            'rol_id' => $adminRol->id,
            'estado' => true,
        ]);

        $this->comprasUser = User::create([
            'nombre' => 'Compras Test',
            'email' => 'comprastest@cooperativa.com',
            'password' => bcrypt('password'),
            'rol_id' => $comprasRol->id,
            'estado' => true,
        ]);
    }

    /**
     * Test list backups.
     */
    public function test_admin_can_list_backups()
    {
        Sanctum::actingAs($this->adminUser);

        Respaldo::create([
            'nombre_archivo' => 'test_backup.zip',
            'tipo' => 'manual',
            'tamano' => 12345,
            'estado' => 'completado',
            'creado_por' => $this->adminUser->id,
        ]);

        $response = $this->getJson('/api/respaldos');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'current_page',
            'last_page',
            'total'
        ]);
    }

    public function test_non_admin_cannot_list_backups()
    {
        Sanctum::actingAs($this->comprasUser);

        $response = $this->getJson('/api/respaldos');

        $response->assertStatus(403);
    }

    /**
     * Test secure download checks.
     */
    public function test_download_checks_valid_backup()
    {
        Sanctum::actingAs($this->adminUser);

        $respaldo = Respaldo::create([
            'nombre_archivo' => 'non_existing_backup_file.zip',
            'tipo' => 'manual',
            'tamano' => 12345,
            'estado' => 'completado',
            'creado_por' => $this->adminUser->id,
        ]);

        $response = $this->getJson("/api/respaldos/{$respaldo->id}/descargar");
        
        // Should return 404 because file doesn't actually exist on disk in test
        $response->assertStatus(404);
        $response->assertJson([
            'message' => 'El archivo de respaldo no existe en el disco.'
        ]);
    }

    public function test_cannot_download_failed_backup()
    {
        Sanctum::actingAs($this->adminUser);

        $respaldo = Respaldo::create([
            'nombre_archivo' => 'failed_backup.zip',
            'tipo' => 'manual',
            'tamano' => 0,
            'estado' => 'fallido',
            'creado_por' => $this->adminUser->id,
        ]);

        $response = $this->getJson("/api/respaldos/{$respaldo->id}/descargar");
        
        $response->assertStatus(400);
        $response->assertJson([
            'message' => 'El respaldo seleccionado no se completó con éxito.'
        ]);
    }

    /**
     * Test delete backup.
     */
    public function test_admin_can_delete_backup()
    {
        Sanctum::actingAs($this->adminUser);

        $respaldo = Respaldo::create([
            'nombre_archivo' => 'temp_test_to_delete.zip',
            'tipo' => 'manual',
            'tamano' => 100,
            'estado' => 'completado',
            'creado_por' => $this->adminUser->id,
        ]);

        $response = $this->deleteJson("/api/respaldos/{$respaldo->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('respaldos', ['id' => $respaldo->id]);
    }
}
