<?php

namespace Tests\Feature\Controllers;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UsuarioControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $admin;
    private $nonAdmin;
    private $adminRole;
    private $otherRole;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->adminRole = Rol::firstOrCreate(['nombre' => 'Administrador General']);
        $this->otherRole = Rol::firstOrCreate(['nombre' => 'Consulta']);

        $this->admin = User::create([
            'nombre' => 'Admin User',
            'email' => 'admin_ctrl@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $this->adminRole->id,
            'estado' => true,
        ]);

        $this->nonAdmin = User::create([
            'nombre' => 'Consulta User',
            'email' => 'consulta_ctrl@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $this->otherRole->id,
            'estado' => true,
        ]);
    }

    /**
     * Test authorization middleware and roles blocking.
     */
    public function test_admin_only_access_restriction(): void
    {
        // 1. Non-admin gets 403 on users listing
        Sanctum::actingAs($this->nonAdmin);
        $response = $this->getJson('/api/usuarios');
        $response->assertStatus(403);

        // 2. Admin gets 200
        Sanctum::actingAs($this->admin);
        $response = $this->getJson('/api/usuarios');
        $response->assertStatus(200);
    }

    /**
     * Test creating a user.
     */
    public function test_user_creation(): void
    {
        Sanctum::actingAs($this->admin);
        $response = $this->postJson('/api/usuarios', [
            'nombre' => 'Nuevo Usuario Técnico',
            'email' => 'newuser@example.com',
            'password' => 'securePassword123!',
            'rol_id' => $this->otherRole->id,
            'estado' => true,
        ]);

        $response->assertStatus(201)
                 ->assertJson([
                     'email' => 'newuser@example.com',
                 ]);

        $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);
    }

    /**
     * Test user creation validation rules.
     */
    public function test_user_creation_validation(): void
    {
        Sanctum::actingAs($this->admin);
        $response = $this->postJson('/api/usuarios', [
            'nombre' => '',
            'email' => 'invalid-email',
            'password' => '123', // Too short
            'rol_id' => 9999, // Inexistent role
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['nombre', 'email', 'password', 'rol_id']);
    }

    /**
     * Test showing, updating and deleting a user.
     */
    public function test_user_details_update_and_delete(): void
    {
        $targetUser = User::create([
            'nombre' => 'Target User',
            'email' => 'target@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $this->otherRole->id,
            'estado' => true,
        ]);

        Sanctum::actingAs($this->admin);

        // Get user details
        $this->getJson("/api/usuarios/{$targetUser->id}")
             ->assertStatus(200)
             ->assertJson(['email' => 'target@example.com']);

        // Update user
        $this->putJson("/api/usuarios/{$targetUser->id}", [
                 'nombre' => 'Target Updated',
                 'email' => 'target_new@example.com',
                 'rol_id' => $this->otherRole->id,
                 'estado' => false,
             ])
             ->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'nombre' => 'Target Updated',
            'email' => 'target_new@example.com',
            'estado' => false,
        ]);

        // Delete user (logical deactivation, returns 200)
        $this->deleteJson("/api/usuarios/{$targetUser->id}")
             ->assertStatus(200)
             ->assertJson(['message' => 'Usuario inhabilitado']);
    }
}
