const fs = require('fs');
const glob = require('glob'); // Note: glob might not be installed, better use native fs

const files = [
  'control-compras-frontend/src/features/servicios/VehiculosList.tsx',
  'control-compras-frontend/src/features/servicios/ServiciosList.tsx',
  'control-compras-frontend/src/features/servicios/MaquinariaList.tsx',
  'control-compras-frontend/src/features/servicios/InspeccionesList.tsx',
  'control-compras-frontend/src/features/servicios/AlquilerGruasList.tsx',
  'control-compras-frontend/src/features/compras/ComprasHistorial.tsx',
  'control-compras-frontend/src/features/admin/RespaldosView.tsx',
  'control-compras-frontend/src/features/admin/ProveedoresList.tsx',
  'control-compras-frontend/src/features/admin/BocaminasList.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log('Skipping ' + file);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add showNoDeleteModal to useAuth destruct
  content = content.replace(/const \{([^}]+?canDelete[^}]+?)\} = useAuth\(\);/, (match, inner) => {
    if (!inner.includes('showNoDeleteModal')) {
      return \const { \, showNoDeleteModal } = useAuth();\;
    }
    return match;
  });

  // 2. Fix handleDelete logic
  // Find \if (!canDelete()) {\ or \if (!canDelete) {\ followed by a block.
  content = content.replace(/if\s*\(!(?:authCanDelete|canDelete)(?:\(\))?\)\s*\{([\s\S]*?)return;/g, (match, body) => {
     if (!body.includes('showNoDeleteModal')) {
       return \if (!canDelete()) {
      showNoDeleteModal();
      return;\;
     }
     return match;
  });

  // Special for ComprasHistorial where it's not a function call
  content = content.replace(/if\s*\(!canDelete\)\s*\{([\\s\\S]*?)return;/g, (match, body) => {
     if (!body.includes('showNoDeleteModal')) {
       return \if (!canDelete) {
      showNoDeleteModal();
      return;\;
     }
     return match;
  });

  // 3. Remove disabled attribute from delete buttons
  content = content.replace(/disabled=\{!canDelete(?:\(\))?\}/g, '');
  
  // Clean up title logic
  content = content.replace(/title=\{!canDelete(?:\(\))?\s*\?\s*\'[^\']+\'\s*:\s*(\'[^\']+\')\}/g, 'title=');
  
  // ComprasHistorial hides action columns entirely
  // {canDelete && <th ...>Acciones</th>}
  content = content.replace(/\{canDelete\s*&&\s*(<th[^>]*>Acciones<\\/th>)\}/g, '');
  // {canDelete && ( <button> )}
  // This is too complex for regex, I'll fix ComprasHistorial manually

  fs.writeFileSync(file, content);
  console.log('Processed ' + file);
}
