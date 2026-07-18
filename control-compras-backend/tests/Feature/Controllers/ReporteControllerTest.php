<?php

namespace Tests\Feature\Controllers;

use App\Models\Bocamina;
use App\Models\Compra;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ReporteControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $user;
    private $bocamina;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Rol::firstOrCreate(['nombre' => 'Gerencia']);
        $this->user = User::create([
            'nombre' => 'Gerente General',
            'email' => 'gerente_ctrl@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $role->id,
            'estado' => true,
        ]);

        $this->bocamina = Bocamina::create([
            'nombre' => 'Central',
            'estado' => true,
        ]);
    }

    /**
     * Test report dashboard statistics retrieval.
     */
    public function test_reportes_dashboard_endpoint(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/reportes/dashboard');
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'total_compras',
                     'gasto_total',
                     'total_proveedores',
                     'total_bocaminas',
                     'gastos_por_bocamina',
                     'compras_recientes'
                 ]);
    }

    /**
     * Test generating report data endpoint.
     */
    public function test_generar_reporte_endpoint(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/reportes/generar?inicio=2026-07-01&fin=2026-07-31');
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'resumen' => [
                         'gasto_total',
                         'total_operaciones',
                     ],
                     'gastos_bocamina',
                     'gastos_proveedor',
                     'top_materiales',
                     'compras',
                 ]);
    }

    /**
     * Test generating report PDF export (checking Content-Type and headers).
     */
    public function test_exportar_pdf_reporte(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/reportes/exportar/pdf?inicio=2026-07-01&fin=2026-07-31');
        
        $response->assertStatus(200)
                 ->assertHeader('Content-Type', 'application/pdf');
    }

    /**
     * Test generating report Excel spreadsheet export (checking Content-Type and headers).
     */
    public function test_exportar_excel_reporte(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/reportes/exportar/excel?inicio=2026-07-01&fin=2026-07-31');
        
        $response->assertStatus(200)
                 ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
}
