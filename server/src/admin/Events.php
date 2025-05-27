<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../conexion.php';

class Events {
    private $conn;
    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function create($data) {
        if (!isset($data['titulo'], $data['descripcion'], $data['fecha_inicio'], $data['fecha_fin'])) {
            echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
            return;
        }
        $certificado_img = isset($data['certificado_img']) ? $data['certificado_img'] : null;
        $stmt = $this->conn->prepare('INSERT INTO eventos (titulo, descripcion, fecha_inicio, fecha_fin, certificado_img) VALUES (?, ?, ?, ?, ?)');
        $ok = $stmt->execute([
            $data['titulo'],
            $data['descripcion'],
            $data['fecha_inicio'],
            $data['fecha_fin'],
            $certificado_img
        ]);
        if ($ok) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al crear evento']);
        }
    }

    public function uploadCertificado($file, $nombreArchivo) {
        // Ruta absoluta a la carpeta certificate
        $targetDir = realpath(__DIR__ . '/../../src/certificate/');
        if ($targetDir === false) {
            $targetDir = __DIR__ . '/../../src/certificate/';
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0777, true);
            }
        }
        $targetFile = rtrim($targetDir, '/\\') . DIRECTORY_SEPARATOR . $nombreArchivo;
        $ok = false;
        if (isset($file['tmp_name']) && is_uploaded_file($file['tmp_name'])) {
            $ok = move_uploaded_file($file['tmp_name'], $targetFile);
        }
        if (!$ok && isset($file['tmp_name']) && file_exists($file['tmp_name'])) {
            $ok = copy($file['tmp_name'], $targetFile);
        }
        if ($ok) {
            $ruta = $nombreArchivo;
            echo json_encode(['success' => true, 'certificado_img' => $ruta]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al subir el archivo']);
        }
    }
}

$events = new Events();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Si es subida de archivo
    if (isset($_FILES['certificado'])) {
        $nombreArchivo = $_FILES['certificado']['name'];
        $events->uploadCertificado($_FILES['certificado'], $nombreArchivo);
        exit;
    }
    // Si es creación de evento
    $data = json_decode(file_get_contents('php://input'), true);
    $events->create($data);
    exit;
}
echo json_encode(['success' => false, 'message' => 'Método no soportado']); 