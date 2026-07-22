<?php

use Illuminate\Support\Facades\Route;

// Helper route for cPanel hosting to create storage symlink without SSH
Route::get('/symlink', function () {
    $target = storage_path('app/public');
    $shortcut = public_path('storage');
    if (!file_exists($shortcut)) {
        @symlink($target, $shortcut);
        return 'Enlace simbólico creado exitosamente para imágenes';
    }
    return 'El enlace simbólico ya existe';
});

// Helper route for cPanel hosting to reset admin password and ensure admin user exists
Route::get('/reset-admin', function () {
    try {
        $rol = \App\Models\Rol::where('nombre', 'Administrador General')->first();
        if (!$rol) {
            $rol = \App\Models\Rol::create(['nombre' => 'Administrador General', 'descripcion' => 'Administrador del sistema']);
        }
        
        $user = \App\Models\User::where('email', 'admin@cooperativa.com')->first();
        if (!$user) {
            $user = \App\Models\User::create([
                'nombre' => 'Admin Cooperativa',
                'email' => 'admin@cooperativa.com',
                'password' => \Illuminate\Support\Facades\Hash::make('Admin2026!'),
                'rol_id' => $rol->id,
                'estado' => true,
            ]);
            return 'Usuario admin@cooperativa.com creado exitosamente con clave: Admin2026!';
        }

        $user->password = \Illuminate\Support\Facades\Hash::make('Admin2026!');
        $user->estado = true;
        $user->rol_id = $rol->id;
        $user->save();

        return 'Contraseña de admin@cooperativa.com restablecida correctamente a: Admin2026!';
    } catch (\Throwable $e) {
        return 'Error al restablecer admin: ' . $e->getMessage();
    }
});

// Helper route for cPanel hosting to seed database with materials, providers, bocaminas, etc.
Route::get('/seed-db', function () {
    try {
        // 1. Seed Proveedores if empty
        if (\Illuminate\Support\Facades\DB::table('proveedores')->count() == 0) {
            \Illuminate\Support\Facades\DB::table('proveedores')->insert([
                ['nombre' => 'Maquinarias Mineras S.A.', 'telefono' => '2223344', 'nit' => '10203040', 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => 'Herramientas del Sur Ltda.', 'telefono' => '5556677', 'nit' => '50607080', 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => 'Insumos Industriales S.R.L.', 'telefono' => '8889900', 'nit' => '90102030', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // 2. Seed Bocaminas if empty
        if (\Illuminate\Support\Facades\DB::table('bocaminas')->count() == 0) {
            \Illuminate\Support\Facades\DB::table('bocaminas')->insert([
                ['nombre' => 'Huari Huari', 'ubicacion' => 'Nivel 1, Sector Norte', 'responsable' => 'Juan Torrez', 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => 'Gran Suraga', 'ubicacion' => 'Nivel 2, Sector Sur', 'responsable' => 'Juan Carlos Incata', 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => '4 Estrellas', 'ubicacion' => 'Nivel 3, Sector Este', 'responsable' => 'Jose Luis Mencacho', 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => '17 de Junio', 'ubicacion' => 'Nivel 4, Sector Oeste', 'responsable' => 'Emilio Torrez', 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => 'San Lucas', 'ubicacion' => 'Nivel 5, Sector Centro', 'responsable' => 'Waldo Hanco', 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => 'Bocamina Grande', 'ubicacion' => 'Nivel 6, Sector Principal', 'responsable' => 'Elio Caceres', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // 3. Clean duplicates in bocaminas and proveedores
        \Illuminate\Support\Facades\DB::statement("DELETE FROM bocaminas WHERE id NOT IN (SELECT MIN(id) FROM bocaminas GROUP BY nombre)");
        \Illuminate\Support\Facades\DB::statement("DELETE FROM proveedores WHERE id NOT IN (SELECT MIN(id) FROM proveedores GROUP BY nombre)");

        // 4. Truncate materials table
        \Illuminate\Support\Facades\DB::table('materiales')->truncate();

        // 5. Structured catalog with exact categories
        $categories = [
            'Material Explosivo' => [
                'NITRATO (ANFO)', 'DINAMITA', 'FULMINANTE (CAPSULAS)', 'GUIA',
                'BARRA 0.80 (COREMAN)', 'BARRA 1.20', 'BARRA 1.80', 'BARRENO 0.80',
                'BARRENO 1.20', 'BARRENO 1.80', 'BROCA Nro. 39 MM', 'BROCA Nro. 41 MM',
                'GARRA 1 CON ESPIGA 3/4', 'GARRA 1 CON ROSCA EXTERIOR 3/4',
                'GARRA DE 1 CON ROSCA INTERIOR 1', 'CARGADOR DE ANFO CON ESPIGA DE 3/4',
                'BARRA 0.60'
            ],
            'Accesorios e Instalaciones' => [
                'LLAVE DE PASO 1 GALVANIZADO', 'LLAVE DE PASO 1 CORTINA GALVANIZADO',
                'LLAVE DE PASO 2 GALVANIZADO', 'LLAVE DE PASO 2 CORTINA GALVANIZADO',
                'UNION PATENTE 1 GALVANIZADO CON BRONCE', 'UNION PATENTE 2 GALVANIZADO CON BRONCE',
                'NIPLE DE 1 GALVANIZADO', 'NIPLE DE 2 GALVANIZADO', 'COPLA DE 1 GALVANIZADO',
                'COPLA DE 2 GALVANIZADO', 'CODO DE 2 GALVANIZADO', 'T DE 1 GALVANIZADO',
                'T DE 2 GALVANIZADO', 'Y DE 1 GALVANIZADO', 'Y DE 2 GALVANIZADO',
                'CANOTO CON ESPIGA DE 1', 'CANOTO A ROSCA DE 1', 'CANOTO CON ESPIGA DE 2',
                'CANOTO A ROSCA DE 2', 'REDUCCION DE 2 A 1', 'REDUCCION DE 2 A 1.5',
                'REDUCCION CON ESPIGA DE 2 A 1.5', 'CLAVOS 7 PULGADAS', 'CLAVOS 6 PULGADAS',
                'CLAVOS 5 PULGADAS', 'CLAVOS 4 PULGADAS', 'BARILLA DE 3/8', 'BARILLA DE 1/2',
                'VOLANDAS PLANA DE 3/8', 'TUERCA DE 3/8', 'VOLANDAS PLANA DE 1/2',
                'TUERCA DE 1/2', 'PERNOS DE 3/8 X 2', 'RODAMIENTO A BOLA 6209-2RS CARRO',
                'RODAMIENTO A BOLA 63092RSC3 GUINCHE', 'RADIO JANDI', 'REDUCCION DE 1 A 3/4',
                'RODAMIENTO A BOLA 62102RSC3 GUINCHE', 'RODAMIENTO 6212-2RS GUINCHE',
                'POLITUBO DE 2', 'POLITUBO DE 1', 'LLAVE DE PASO 3 GALVANIZADO',
                'GRAPAS CROSPI Nro. 13', 'GRAPAS CROSPI Nro. 10', 'LLAVE CRECEN Nro. 10',
                'RASTRILLO', 'GRAPAS CROSPI Nro. 16'
            ],
            'Herramientas' => [
                'PICOTA CON PALA ANCHA', 'PICOTA NORMAL', 'PALA PUNTA HUEVO', 'COMBO DE 2K',
                'COMBO DE 12 LB', 'STILLSON # 24', 'STILLSON # 14', 'SIERRA MECANICA Nro. 12',
                'CURVINA 24', 'DISCO DE DESGASTE DE 9', 'DISCO DE DESGASTE DE 4.5',
                'DISCO DE CORTE 7', 'DISCO DE CORTE 9', 'DISCO DE CORTE 4.5',
                'ELECTRODO E6013', 'ELECTRODO E7018', 'CABLE DE ACERO 1/2', 'CABLE DE ACERO 3/8',
                'SOGA 3/4', 'SOGA 1/2', 'CEPILLO DE ACERO', 'FLEXOMETRO DE 5 MTS',
                'STILLSON # 18', 'HOJAS DE CURVINA 24', 'HOJAS DE SIERRA 12',
                'CAMARAS 4.00-8 CARRETILLA', 'NEUMATICO PARA CARRETILLA 3.50-8',
                'ALAMBRE GALVANIZADO 6', 'ALAMBRE DE AMARRE 6', 'ALQUITRAN VISCOLA',
                'ALICATE PARA ANILLOS 7', 'ESTUCHE DE ACCESORIOS COMPRESOR NEUMATICOS', 'PUNTAS'
            ],
            'Lubricantes y Aceites' => [
                'ACEITE DE MAQUINA', 'ACEITE MOTOR 15W40 DIESEL', 'ACEITE TELLUS 2M / 68',
                'ACEITE HIDRAULICO ISO/68', 'GASOLINA', 'DIESEL', 'GRASA DE RODAMIENTOS'
            ],
            'Filtros y Correas' => [
                'FILTRO DE AIRE C23610 COMPRESORA', 'FILTRO DE AIRE C20500 COMPRESORA',
                'FILTRO DE AIRE SFA1107H GEN. AZUL', 'FILTRO DE AIRE SFA1196H GEN. BLANCO',
                'FILTRO DE ACEITE PSL962 COMPRESORA', 'FILTRO DE ACEITE 1R-0739 PALA',
                'FILTRO DE DIESEL P551010', 'CORREA 17X2845 B-112 GUINCHE',
                'CORREA AX-32 PALA', 'CORREA A-52 PALA', 'CORREA A-72 PALA',
                'FILTRO DE AIRE SFA 2499 SET PALA', 'FILTRO DE AIRE SFA 2500S PALA',
                'FILTRO DE ACEITE SPO4111 GEN. BLANCO', 'FILTRO DE ACEITE SFO0754 GEN. AZUL Y AMARILLO',
                'FILTRO DE ACEITE BT 339 GEN. AZUL', 'FILTRO DE ACEITE PSL597 GEN. AZUL',
                'FILTRO DE DIESEL WK1060/1 COMPRESORA', 'FILTRO DE DIESEL PSC877 GEN. AZUL',
                'FILTRO DE DIESEL SFR0143FW GEN. BLANCO', 'FILTRO DE DIESEL P551427 GEN. AZUL',
                'FILTRO DE DIESEL WK723 COMPRESORA', 'FILTRO DE DIESEL 1R-0753 PALA',
                'FILTRO DE DIESEL P551424 COMP. AMARILLA', 'FILTRO SEPARADOR DIESEL 151-2409 PALA',
                'CORREA 17X3048 B-120 WINCHE-80', 'FILTRO DE DIESEL WK1060/1 BARRA'
            ],
            'Equipos de Protección Personal' => [
                'SACO IMPERMEABLE TALLA M', 'SACO IMPERMEABLE TALLA L', 'PANTALON IMPERMEABLE TALLA M',
                'PANTALON IMPERMEABLE TALLA L', 'OVEROLES TALLA M', 'OVEROLES TALLA L',
                'OVEROLES TALLA XL', 'CASCO MINERO BLANCO', 'CASCO MINERO CAFE',
                'BOTAS DE GOMA 38', 'BOTAS DE GOMA 39', 'BOTAS DE GOMA 40', 'BOTAS DE GOMA 41',
                'ARNES DE SEGURIDAD', 'GUANTES CON GOMA', 'LAMPARAS', 'BUSO DESECHABLE TALLA M',
                'BUSO DESECHABLE TALLA L', 'CHALECOS REFLECTIVOS TALLA M', 'CHALECOS REFLECTIVOS TALLA L',
                'CHALECOS REFLECTIVOS TALLA XL', 'POLARES TALLA M', 'POLARES TALLA L',
                'DEPORTIVOS TALLA M', 'DEPORTIVOS TALLA L', 'CAPUCHON PARA CASCO',
                'CABO DE VIDA DE UNA COLA', 'CABO DE VIDA DE DOS COLAS', 'SACO IMPERMEABLE TALLA XL',
                'PANTALON IMPERMEABLE TALLA XL'
            ],
            'Herramientas de Mecánica' => [
                'ARCO DE SOLDAR CROWN', 'CARGADOR DE BATERIAS CD-530', 'TUBO DE OXIGENO MEDIANO',
                'WINCHE TAMAÑO PEQUEÑO', 'WINCHE TAMAÑO GRANDE', 'AMOLADORA TAMAÑO GRANDE',
                'AMOLADORA TAMAÑO PEQUEÑO', 'MOTOSIERRA INECO', 'SOPLETE MANUAL', 'SOPLETE DE PINTURA',
                'MICRO GASOGENO 1K', 'RODILLO PARA WINCHE', 'CARRO METALERO DE 1 TN',
                'CARRO TRANSPORTADORA DE MINERAL A METALICO', 'CARRO TRANSPORTADORA DE MINERAL A NEUMATICO',
                'RONDANA TAMAÑO GRANDE DE 10', 'CARRO TRANSPORTADORA DE MADERA',
                'ESTUCHE DE LLAVES DADO UTUSTOOLS', 'ESTUCHE DE BROCAS TAMAÑO PEQUEÑO INECO',
                'DESARMADOR A BATERIA DYLLU', 'ESTUCHE DE LLAVES DADO TAMAÑO PEQUEÑO TRAMONTINA',
                'ESTUCHE DE SOLDAR WELDING NEGRO', 'ESTUCHE DE TARRAJA NEVA PROFESIONAL 1/2 A 2',
                'MANGUERA DE OXIGENO COMPLETO', 'HIDROLAVADORA TRAMONTINA', 'SOLDADURA DE ESTAÑO EN HILO',
                'BATERIA BOSCH', 'PASTA DE ESTAÑO EN SOLDADURA', 'ENGRASADORA 5K TRUPER', 'MOTOR DE ARRANQUE'
            ],
            'Pinturas y Anticongelantes' => [
                'ANTICONGELANTE', 'THINNER 900CC', 'DESENGRASANTE DE MOTOR', 'MONOPOL NEGRO',
                'MONOPOL AMARILLO', 'MONOPOL AZUL', 'AEROSOL VERDE', 'AEROSOL AZUL',
                'AEROSOL ROJO', 'AEROSOL AMARILLO', 'LIMPIA CONTACTO', 'PEGATANKE'
            ],
            'Material Eléctrico' => [
                'CAJA DISTRIBUIDORA ELECTRICA DE 59X50X20', 'CAJA DISTRIBUIDORA ELECTRICA DE 40X30X17',
                'TERMICO TRIFASICO', 'TERMICO MONOFASICO', 'REFLECTOR LED 200W', 'REFLECTOR LED 50W',
                'FOCO 9W', 'INTERRUPTOR MIXTO', 'ENCHUFE', 'CINTA ELECTRICA', 'CINTA ELECTRICA DE GOMA',
                'PRECINTO PLASTICO 5X300MM', 'PRECINTO PLASTICO 4.8MM'
            ],
            'Maderas y Tablones' => [
                'CALLAPOS DE 2.50 MTS', 'CHAJLLA REDONDA DE 2.50 MTS', 'CHAJLLA RALLADA DE 2.50 MTS',
                'MADERA LABRADA DE 3 X 3 X 2.50 MTS', 'DURMIENTE DE 3 X 6 X 1 MTS',
                'LINEA DE MADERA DE 3 X 3 X 4 MTS', 'ESCALERA DE MADERA 4 MTS', 'TABLON DE MADERA 1.5 X 3 X 2.50 MTS'
            ],
            'Otros' => [
                'BALDES', 'SACOS', 'GUINCHE', 'RONDANAS', 'FRENO DE GUINCHE', 'GANCHOS', 'SOGAS'
            ],
        ];

        $groupPrefixes = [
            'Material Explosivo' => 'G-1',
            'Accesorios e Instalaciones' => 'G-2',
            'Herramientas' => 'G-3',
            'Lubricantes y Aceites' => 'G-4',
            'Filtros y Correas' => 'G-5',
            'Equipos de Protección Personal' => 'G-6',
            'Herramientas de Mecánica' => 'G-7',
            'Pinturas y Anticongelantes' => 'G-8',
            'Material Eléctrico' => 'G-9',
            'Maderas y Tablones' => 'G-10',
            'Otros' => 'G-11',
        ];

        $toInsert = [];
        $now = now();

        foreach ($categories as $catName => $items) {
            $prefix = $groupPrefixes[$catName] ?? 'G-11';
            $idx = 1;
            foreach ($items as $item) {
                $code = sprintf("%s/%04d", $prefix, $idx++);
                $toInsert[] = [
                    'codigo' => $code,
                    'descripcion' => mb_strtoupper(trim($item), 'UTF-8'),
                    'grupo' => $catName,
                    'estado' => 'disponible',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        foreach (array_chunk($toInsert, 50) as $chunk) {
            \Illuminate\Support\Facades\DB::table('materiales')->insert($chunk);
        }

        // 6. Seed sample compras if compras table is empty
        if (\Illuminate\Support\Facades\DB::table('compras')->count() == 0) {
            $adminUser = \App\Models\User::first();
            $proveedor = \App\Models\Proveedor::first();
            $bocamina = \App\Models\Bocamina::first();
            $matList = \App\Models\Material::limit(3)->get();

            if ($adminUser && $proveedor && $bocamina && $matList->count() > 0) {
                $compra = \App\Models\Compra::create([
                    'proveedor_id' => $proveedor->id,
                    'usuario_id' => $adminUser->id,
                    'bocamina_id' => $bocamina->id,
                    'fecha' => now()->format('Y-m-d'),
                    'numero_factura' => 'F-0001',
                    'observaciones' => 'Compra inicial registrada automáticamente',
                    'total' => 0,
                    'estado' => 'registrada',
                ]);

                $total = 0;
                foreach ($matList as $mat) {
                    $subtotal = 5 * 100;
                    $total += $subtotal;
                    \App\Models\DetalleCompra::create([
                        'compra_id' => $compra->id,
                        'material_id' => $mat->id,
                        'cantidad' => 5,
                        'precio' => 100,
                        'subtotal' => $subtotal,
                    ]);
                }
                $compra->update(['total' => $total]);
            }
        }

        $count = \Illuminate\Support\Facades\DB::table('materiales')->count();

        return "¡Éxito total! Se cargaron {$count} materiales clasificados por grupo (G-1 a G-11), compras iniciales, y se limpiaron los duplicados de bocaminas y proveedores.";
    } catch (\Throwable $e) {
        return 'Error al procesar datos: ' . $e->getMessage();
    }
});

// Serve compiled React SPA (index.html) for all web routes except /api and /sanctum
Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }
    return view('welcome');
})->where('any', '^(?!api|sanctum|symlink|reset-admin|seed-db).*$');

