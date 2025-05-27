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

class GetEventos {
    private $conn;
    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }
    public function handle() {
        $stmt = $this->conn->prepare('SELECT e.*, w.url_web FROM eventos e LEFT JOIN web_evento w ON e.id_evento = w.id_evento ORDER BY fecha_inicio DESC');
        $stmt->execute();
        $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'eventos' => $eventos]);
    }
}

$getEventos = new GetEventos();
$getEventos->handle(); 