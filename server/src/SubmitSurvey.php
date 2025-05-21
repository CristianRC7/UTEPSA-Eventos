<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../conexion.php';

class SurveyForm {
    private $conn;
    public function __construct($db) {
        $this->conn = $db;
    }

    public function submit($id_usuario, $id_actividad, $rating, $descripcion) {
        if (!$id_usuario || !$id_actividad || !$rating) {
            return [
                'success' => false,
                'message' => 'Faltan datos requeridos.'
            ];
        }
        // Verificar si ya existe una respuesta
        $stmt = $this->conn->prepare("SELECT id_formulario FROM formularios WHERE id_usuario = ? AND id_actividad = ?");
        $stmt->execute([$id_usuario, $id_actividad]);
        if ($stmt->fetch()) {
            return [
                'success' => false,
                'message' => 'Ya enviaste una respuesta para esta actividad.'
            ];
        }
        $stmt = $this->conn->prepare("INSERT INTO formularios (id_usuario, id_actividad, rating, descripcion) VALUES (?, ?, ?, ?)");
        $ok = $stmt->execute([$id_usuario, $id_actividad, $rating, $descripcion]);
        if ($ok) {
            return ['success' => true, 'message' => 'Encuesta enviada correctamente.'];
        } else {
            return ['success' => false, 'message' => 'Error al guardar la encuesta.'];
        }
    }
}

$database = new Database();
$db = $database->getConnection();
$survey = new SurveyForm($db);

$data = json_decode(file_get_contents("php://input"), true);
$id_usuario = $data['id_usuario'] ?? null;
$id_actividad = $data['id_actividad'] ?? null;
$rating = $data['rating'] ?? null;
$descripcion = $data['descripcion'] ?? null;

$result = $survey->submit($id_usuario, $id_actividad, $rating, $descripcion);
echo json_encode($result); 