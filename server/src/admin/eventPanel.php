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

class EventPanel {
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
        // Datos del evento
        $stmt = $this->conn->prepare('SELECT e.*, w.url_web FROM eventos e LEFT JOIN web_evento w ON e.id_evento = w.id_evento WHERE e.id_evento = ? LIMIT 1');
        $stmt->execute([$id_evento]);
        $evento = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$evento) {
            echo json_encode(['success' => false, 'message' => 'Evento no encontrado']);
            exit;
        }
        // Inscritos al evento
        $stmt = $this->conn->prepare('SELECT u.id_usuario, u.nombre, u.apellido_paterno, u.apellido_materno, u.usuario FROM inscripciones i JOIN usuarios u ON i.id_usuario = u.id_usuario WHERE i.id_evento = ?');
        $stmt->execute([$id_evento]);
        $inscritos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Actividades del evento con cantidad de inscritos y si la inscripción está habilitada
        $stmt = $this->conn->prepare('SELECT a.id_actividad, a.titulo, a.descripcion, a.fecha, a.hora, a.ubicacion, a.inscripcion_habilitada, (SELECT COUNT(*) FROM inscripcion_actividades ia WHERE ia.id_actividad = a.id_actividad) as inscritos FROM cronograma_eventos a WHERE a.id_evento = ?');
        $stmt->execute([$id_evento]);
        $actividades = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode([
            'success' => true,
            'evento' => $evento,
            'inscritos' => $inscritos,
            'actividades' => $actividades
        ]);
    }
}

$panel = new EventPanel();
$panel->handle(); 