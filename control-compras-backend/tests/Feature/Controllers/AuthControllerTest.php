<?php

namespace Tests\Feature\Controllers;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $user;
    private $role;

    protected function setUp(): void
    {
        parent::setUp();
        $this->role = Rol::firstOrCreate(['nombre' => 'Consulta']);
        $this->user = User::create([
            'nombre' => 'Login User',
            'email' => 'loginuser@example.com',
            'password' => bcrypt('password123'),
            'rol_id' => $this->role->id,
            'estado' => true,
        ]);
    }

    /**
     * Test login happy path.
     */
    public function test_login_happy_path(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'loginuser@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'user' => [
                         'id',
                         'nombre',
                         'email',
                         'rol_id',
                     ],
                 ])
                 ->assertJson([
                     'message' => 'Login exitoso',
                 ]);
    }

    /**
     * Test login validation errors (missing fields).
     */
    public function test_login_validation_errors(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => '',
            'password' => '',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email', 'password']);
    }

    /**
     * Test login with invalid credentials.
     */
    public function test_login_invalid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'loginuser@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
                 ->assertJson([
                     'message' => 'Credenciales incorrectas',
                 ]);
    }

    /**
     * Test getting authenticated user profile.
     */
    public function test_user_profile_retrieval(): void
    {
        // Unauthenticated access
        $this->getJson('/api/user')->assertStatus(401);

        // Authenticated access
        $response = Sanctum::actingAs($this->user);
        $response = $this->getJson('/api/user');
        $response->assertStatus(200)
                 ->assertJson([
                     'email' => 'loginuser@example.com',
                 ]);
    }

    /**
     * Test logout.
     */
    public function test_logout(): void
    {
        Sanctum::actingAs($this->user);
        $response = $this->postJson('/api/logout');
        $response->assertStatus(200)
                 ->assertJson(['message' => 'Sesión cerrada correctamente']);
    }
}
