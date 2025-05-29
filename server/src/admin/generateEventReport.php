<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../conexion.php';
require_once __DIR__ . '/../library/vendor/tecnickcom/tcpdf/tcpdf.php';

$id_evento = $_GET['id_evento'] ?? null;
if (!$id_evento) {
    http_response_code(400);
    echo 'Falta id_evento';
    exit;
}

$db = new Database();
$conn = $db->getConnection();

// Obtener datos del evento
$stmt = $conn->prepare('SELECT e.*, w.url_web FROM eventos e LEFT JOIN web_evento w ON e.id_evento = w.id_evento WHERE e.id_evento = ? LIMIT 1');
$stmt->execute([$id_evento]);
$evento = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$evento) {
    http_response_code(404);
    echo 'Evento no encontrado';
    exit;
}
// Inscritos al evento
$stmt = $conn->prepare('SELECT u.id_usuario, u.nombre, u.apellido_paterno, u.apellido_materno, u.usuario FROM inscripciones i JOIN usuarios u ON i.id_usuario = u.id_usuario WHERE i.id_evento = ?');
$stmt->execute([$id_evento]);
$inscritos = $stmt->fetchAll(PDO::FETCH_ASSOC);
// Actividades del evento
$stmt = $conn->prepare('SELECT a.id_actividad, a.titulo, a.descripcion, a.fecha, a.hora, a.ubicacion, a.inscripcion_habilitada, (SELECT COUNT(*) FROM inscripcion_actividades ia WHERE ia.id_actividad = a.id_actividad) as inscritos FROM cronograma_eventos a WHERE a.id_evento = ?');
$stmt->execute([$id_evento]);
$actividades = $stmt->fetchAll(PDO::FETCH_ASSOC);
// Valoraciones por actividad
$valoraciones = [];
foreach ($actividades as $act) {
    $id_actividad = $act['id_actividad'];
    $stmtF = $conn->prepare('SELECT rating, descripcion FROM formularios WHERE id_actividad = ?');
    $stmtF->execute([$id_actividad]);
    $formularios = $stmtF->fetchAll(PDO::FETCH_ASSOC);
    $cantidad = count($formularios);
    $promedio = $cantidad > 0 ? array_sum(array_column($formularios, 'rating')) / $cantidad : null;
    $descripciones = array_filter(array_map(function($f) { return $f['descripcion']; }, $formularios));
    $valoraciones[$id_actividad] = [
        'cantidad' => $cantidad,
        'promedio' => $promedio,
        'descripciones' => $descripciones
    ];
}

// --- Generar PDF ---
$pdf = new TCPDF();
$pdf->SetCreator('UTEPSA Eventos');
$pdf->SetAuthor('UTEPSA');
$pdf->SetTitle('Reporte de Evento');
$pdf->SetMargins(15, 20, 15);
$pdf->AddPage();

// Título principal
define('UTF8_DECODE', true);
$pdf->SetFont('helvetica', 'B', 18);
$pdf->Cell(0, 12, 'Reporte de Evento', 0, 1, 'C');
$pdf->Ln(2);
$pdf->SetFont('helvetica', '', 14);
$pdf->Cell(0, 10, $evento['titulo'], 0, 1, 'C');
$pdf->Ln(5);

// Datos generales del evento
$pdf->SetFont('helvetica', '', 11);
$pdf->MultiCell(0, 7, 'Descripción: ' . ($evento['descripcion'] ?? '-'), 0, 'L');
$pdf->MultiCell(0, 7, 'Fecha: ' . ($evento['fecha_inicio'] ?? '-') . ' a ' . ($evento['fecha_fin'] ?? '-'), 0, 'L');
$pdf->MultiCell(0, 7, 'Web: ' . ($evento['url_web'] ?? '-'), 0, 'L');
$pdf->Ln(3);

// Inscritos
$pdf->SetFont('helvetica', 'B', 12);
$pdf->Cell(0, 8, 'Inscritos al evento (' . count($inscritos) . ')', 0, 1, 'L');
$pdf->SetFont('helvetica', '', 10);
if (count($inscritos) > 0) {
    $tbl = '<table border="1" cellpadding="3"><thead><tr><th><b>Nombre</b></th><th><b>Usuario</b></th></tr></thead><tbody>';
    foreach ($inscritos as $ins) {
        $nombre = $ins['nombre'] . ' ' . $ins['apellido_paterno'] . ' ' . $ins['apellido_materno'];
        $tbl .= '<tr><td>' . htmlspecialchars($nombre) . '</td><td>' . htmlspecialchars($ins['usuario']) . '</td></tr>';
    }
    $tbl .= '</tbody></table>';
    $pdf->writeHTML($tbl, true, false, false, false, '');
} else {
    $pdf->Cell(0, 7, 'No hay inscritos.', 0, 1);
}
$pdf->Ln(2);

// Actividades
$pdf->SetFont('helvetica', 'B', 12);
$pdf->Cell(0, 8, 'Actividades del evento (' . count($actividades) . ')', 0, 1, 'L');
$pdf->SetFont('helvetica', '', 10);
if (count($actividades) > 0) {
    $tbl = '<table border="1" cellpadding="3"><thead><tr><th><b>Título</b></th><th><b>Fecha</b></th><th><b>Hora</b></th><th><b>Ubicación</b></th><th><b>Inscritos</b></th><th><b>Inscripción habilitada</b></th></tr></thead><tbody>';
    foreach ($actividades as $act) {
        $tbl .= '<tr>';
        $tbl .= '<td>' . htmlspecialchars($act['titulo']) . '</td>';
        $tbl .= '<td>' . htmlspecialchars($act['fecha']) . '</td>';
        $tbl .= '<td>' . htmlspecialchars($act['hora']) . '</td>';
        $tbl .= '<td>' . htmlspecialchars($act['ubicacion']) . '</td>';
        $tbl .= '<td>' . htmlspecialchars($act['inscritos']) . '</td>';
        $tbl .= '<td>' . ($act['inscripcion_habilitada'] ? 'Sí' : 'No') . '</td>';
        $tbl .= '</tr>';
    }
    $tbl .= '</tbody></table>';
    $pdf->writeHTML($tbl, true, false, false, false, '');
} else {
    $pdf->Cell(0, 7, 'No hay actividades.', 0, 1);
}
$pdf->Ln(2);

// Valoraciones
$pdf->SetFont('helvetica', 'B', 12);
$pdf->Cell(0, 8, 'Valoraciones de actividades', 0, 1, 'L');
$pdf->SetFont('helvetica', '', 10);
if (count($actividades) > 0) {
    $tbl = '<table border="1" cellpadding="3"><thead><tr><th><b>Actividad</b></th><th><b>Promedio (%)</b></th><th><b>Cantidad</b></th><th><b>Comentarios</b></th></tr></thead><tbody>';
    foreach ($actividades as $act) {
        $val = $valoraciones[$act['id_actividad']] ?? ['cantidad'=>0,'promedio'=>null,'descripciones'=>[]];
        $porcentaje = $val['promedio'] !== null ? round(($val['promedio']/5)*100, 1) . ' %' : '-';
        $comentarios = '';
        if (count($val['descripciones']) > 0) {
            foreach ($val['descripciones'] as $desc) {
                $comentarios .= '<li>' . htmlspecialchars($desc) . '</li>';
            }
            $comentarios = '<ul style="padding-left:10px">' . $comentarios . '</ul>';
        } else {
            $comentarios = '-';
        }
        $tbl .= '<tr>';
        $tbl .= '<td>' . htmlspecialchars($act['titulo']) . '</td>';
        $tbl .= '<td>' . $porcentaje . '</td>';
        $tbl .= '<td>' . $val['cantidad'] . '</td>';
        $tbl .= '<td>' . $comentarios . '</td>';
        $tbl .= '</tr>';
    }
    $tbl .= '</tbody></table>';
    $pdf->writeHTML($tbl, true, false, false, false, '');
} else {
    $pdf->Cell(0, 7, 'No hay valoraciones.', 0, 1);
}

// Descargar PDF
$pdf->Output('reporte_evento_' . $id_evento . '.pdf', 'I'); 