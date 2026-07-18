<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityAndSanitizationTest extends TestCase
{
    use DatabaseTransactions;

    private $restrictedUser;
    private $writerUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        $roleConsulta = Rol::firstOrCreate(['nombre' => 'Consulta']);
        $roleCompras = Rol::firstOrCreate(['nombre' => 'Compras']);

        $this->restrictedUser = User::create([
            'nombre' => 'Consulta Security',
            'email' => 'sec_consulta@example.com',
            'password' => bcrypt('password123!'),
            'rol_id' => $roleConsulta->id,
            'estado' => true,
        ]);

        $this->writerUser = User::create([
            'nombre' => 'Compras Security',
            'email' => 'sec_compras@example.com',
            'password' => bcrypt('password123!'),
            'rol_id' => $roleCompras->id,
            'estado' => true,
        ]);
    }

    /**
     * Test missing sanctum authentication token.
     */
    public function test_unauthenticated_requests_block(): void
    {
        $this->getJson('/api/materiales')
             ->assertStatus(401);
    }

    /**
     * Test escalation of privileges is blocked.
     */
    public function test_privilege_escalation_block(): void
    {
        Sanctum::actingAs($this->restrictedUser);

        // Consulta role user cannot create a material
        $this->postJson('/api/materiales', [
            'codigo' => 'SEC-FAIL-1',
            'descripcion' => 'Intento Hack',
        ])->assertStatus(403);
    }

    /**
     * Test SQL Injection protection in search inputs.
     */
    public function test_sql_injection_sanitization(): void
    {
        Sanctum::actingAs($this->writerUser);

        // Send a request with a search string that tries to inject SQL
        $response = $this->getJson("/api/materiales?search=' OR '1'='1");
        
        // Assert that the system handles it gracefully (does not throw a database query error)
        $response->assertStatus(200);
    }

    /**
     * Test XSS Protection middleware (SanitizeInput).
     */
    public function test_xss_protection_middleware(): void
    {
        Sanctum::actingAs($this->writerUser);

        // Send an insertion request containing malicious HTML script tags
        $response = $this->postJson('/api/materiales', [
            'codigo' => 'MAT-SEC-XSS',
            'descripcion' => "Cable blindado <script>alert('XSS')</script>",
            'grupo' => 'Seguridad',
        ]);

        $response->assertStatus(201);

        // Verify that script tag has been stripped or escaped by SanitizeInput middleware
        $this->assertStringNotContainsString("<script>", $response->json('descripcion'));
    }

    /**
     * Test passing extremely long strings.
     */
    public function test_limits_and_invalid_inputs(): void
    {
        Sanctum::actingAs($this->writerUser);

        // Code too long (max:50)
        $longCode = str_repeat('A', 100);

        $response = $this->postJson('/api/materiales', [
            'codigo' => $longCode,
            'descripcion' => 'Material con código excesivamente largo',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['codigo']);
    }
}
