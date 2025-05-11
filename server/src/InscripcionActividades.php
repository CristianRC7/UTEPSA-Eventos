<?php
// Permitir CORS para desarrollo
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../conexion.php';

class InscripcionActividades {
    private $conn;
    private $table_name = "inscripcion_actividades";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function inscribir($id_usuario, $id_actividad) {
        if (!is_numeric($id_usuario) || !is_numeric($id_actividad)) {
            return [
                'success' => false,
                'message' => 'Datos inválidos.'
            ];
        }

        // Verificar si ya está inscrito
        $query_check = "SELECT id_inscripcion_actividad FROM {$this->table_name} WHERE id_usuario = :id_usuario AND id_actividad = :id_actividad";
        $stmt_check = $this->conn->prepare($query_check);
        $stmt_check->bindParam(":id_usuario", $id_usuario);
        $stmt_check->bindParam(":id_actividad", $id_actividad);
        $stmt_check->execute();
        if ($stmt_check->rowCount() > 0) {
            return [
                'success' => false,
                'message' => 'Ya estás inscrito en esta actividad.'
            ];
        }

        // Insertar inscripción
        $query = "INSERT INTO {$this->table_name} (id_usuario, id_actividad) VALUES (:id_usuario, :id_actividad)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_usuario", $id_usuario);
        $stmt->bindParam(":id_actividad", $id_actividad);
        if ($stmt->execute()) {
            return [
                'success' => true,
                'message' => 'Inscripción realizada correctamente.'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'No se pudo realizar la inscripción.'
            ];
        }
    }
}

$database = new Database();
$db = $database->getConnection();
$inscripcionObj = new InscripcionActividades($db);

$input = json_decode(file_get_contents('php://input'), true);
$id_usuario = $input['id_usuario'] ?? null;
$id_actividad = $input['id_actividad'] ?? null;

if ($id_usuario === null || $id_actividad === null) {
    echo json_encode([
        'success' => false,
        'message' => 'Faltan datos requeridos.'
    ]);
    exit;
}

$result = $inscripcionObj->inscribir($id_usuario, $id_actividad);
echo json_encode($result); 