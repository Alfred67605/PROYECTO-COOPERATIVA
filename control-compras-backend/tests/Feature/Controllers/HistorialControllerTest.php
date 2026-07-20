<?php

namespace Tests\Feature\Controllers;

use App\Models\HistorialOperacion;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HistorialControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $admin;
    private $adminRole;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->adminRole = Rol::firstOrCreate(['nombre' => 'Administrador General']);

        $this->admin = User::create([
            'nombre' => 'Admin Test Auditoria',
            'email' => 'admin_audit@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $this->adminRole->id,
            'estado' => true,
        ]);
    }

    public function test_historial_index_returns_paginated_list(): void
    {
        Sanctum::actingAs($this->admin);

        HistorialOperacion::create([
            'usuario_id' => $this->admin->id,
            'accion' => 'crear',
            'tabla' => 'bocaminas',
            'registro_id' => 999,
            'datos_nuevos' => ['nombre' => 'Bocamina Test'],
            'ip' => '127.0.0.1',
            'fecha' => now(),
        ]);

        $response = $this->getJson('/api/historial');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'current_page',
                     'data',
                     'total',
                     'last_page'
                 ]);
    }

    public function test_historial_filtering_by_hour_range(): void
    {
        Sanctum::actingAs($this->admin);

        HistorialOperacion::create([
            'usuario_id' => $this->admin->id,
            'accion' => 'crear',
            'tabla' => 'compras',
            'registro_id' => 101,
            'datos_nuevos' => ['total' => 500],
            'ip' => '127.0.0.1',
            'fecha' => now()->setTime(10, 15, 0),
        ]);

        HistorialOperacion::create([
            'usuario_id' => $this->admin->id,
            'accion' => 'actualizar',
            'tabla' => 'compras',
            'registro_id' => 102,
            'datos_nuevos' => ['total' => 800],
            'ip' => '127.0.0.1',
            'fecha' => now()->setTime(22, 30, 0),
        ]);

        $response = $this->getJson('/api/historial?hora_inicio=09:00&hora_fin=12:00');

        $response->assertStatus(200);
        $data = $response->json('data');

        $this->assertNotEmpty($data);
        foreach ($data as $item) {
            if ($item['registro_id'] == 101) {
                $this->assertEquals('compras', $item['tabla']);
            }
            $this->assertNotEquals(102, $item['registro_id']);
        }
    }

    public function test_historial_show_single_record(): void
    {
        Sanctum::actingAs($this->admin);

        $record = HistorialOperacion::create([
            'usuario_id' => $this->admin->id,
            'accion' => 'eliminar',
            'tabla' => 'materiales',
            'registro_id' => 55,
            'datos_nuevos' => null,
            'ip' => '127.0.0.1',
            'fecha' => now(),
        ]);

        $response = $this->getJson("/api/historial/{$record->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'id' => $record->id,
                     'tabla' => 'materiales',
                     'accion' => 'eliminar',
                 ]);
    }
}
