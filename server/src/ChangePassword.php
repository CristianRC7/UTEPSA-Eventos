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

class ChangePassword {
    private $conn;
    private $table_name = "usuarios";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function updatePassword($id_usuario, $nueva_contrasena) {
        if (!is_numeric($id_usuario) || empty($nueva_contrasena)) {
            return [
                'success' => false,
                'message' => 'Datos inválidos.'
            ];
        }

        $query = "UPDATE {$this->table_name} SET contrasena = :nueva_contrasena WHERE id_usuario = :id_usuario";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":nueva_contrasena", $nueva_contrasena);
        $stmt->bindParam(":id_usuario", $id_usuario);

        if ($stmt->execute()) {
            return [
                'success' => true,
                'message' => 'Contraseña actualizada correctamente.'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'No se pudo actualizar la contraseña.'
            ];
        }
    }
}

$database = new Database();
$db = $database->getConnection();
$changePassObj = new ChangePassword($db);

$data = json_decode(file_get_contents("php://input"));

$id_usuario = $data->id_usuario ?? null;
$nueva_contrasena = $data->nueva_contrasena ?? null;

if ($id_usuario === null || $nueva_contrasena === null) {
    echo json_encode([
        'success' => false,
        'message' => 'Faltan datos requeridos.'
    ]);
    exit;
}

$result = $changePassObj->updatePassword($id_usuario, $nueva_contrasena);
echo json_encode($result); 