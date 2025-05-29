<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../conexion.php';

class GetHabilitadasConValoracion {
    private $conn;
    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }
    public function handle() {
        $id_evento = $_GET['id_evento'] ?? null;
        if (!$id_evento) {
            echo json_encode(['success' => false, 'message' => 'Falta id_evento']);
            exit;
        }
        // Actividades habilitadas para encuestas
        $stmt = $this->conn->prepare('SELECT a.id_actividad, a.titulo, a.descripcion, a.fecha, a.hora, a.ubicacion, a.inscripcion_habilitada, (SELECT COUNT(*) FROM inscripcion_actividades ia WHERE ia.id_actividad = a.id_actividad) as inscritos FROM cronograma_eventos a INNER JOIN habilitacion_formularios h ON a.id_actividad = h.id_actividad WHERE a.id_evento = ?');
        $stmt->execute([$id_evento]);
        $actividades = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Obtener valoraciones de formularios por actividad habilitada
        $valoraciones = [];
        foreach ($actividades as $act) {
            $id_actividad = $act['id_actividad'];
            $stmtF = $this->conn->prepare('SELECT rating, descripcion FROM formularios WHERE id_actividad = ?');
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
        echo json_encode([
            'success' => true,
            'actividades' => $actividades,
            'valoraciones' => $valoraciones
        ]);
    }
}

$handler = new GetHabilitadasConValoracion();
$handler->handle(); 