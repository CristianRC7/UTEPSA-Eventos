<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../conexion.php';

class UserInscriptions {
    private $conn;
    private $table_name = "inscripcion_actividades";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getInscriptions($id_usuario, $id_evento) {
        $query = "SELECT ia.id_inscripcion_actividad, ce.titulo, ce.descripcion, ce.fecha, ce.hora, ce.ubicacion, e.titulo as evento
                  FROM inscripcion_actividades ia
                  JOIN cronograma_eventos ce ON ia.id_actividad = ce.id_actividad
                  JOIN eventos e ON ce.id_evento = e.id_evento
                  WHERE ia.id_usuario = :id_usuario AND e.id_evento = :id_evento";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_usuario", $id_usuario);
        $stmt->bindParam(":id_evento", $id_evento);
        $stmt->execute();

        $inscripciones = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $inscripciones[] = $row;
        }
        return $inscripciones;
    }
}

$database = new Database();
$db = $database->getConnection();
$inscObj = new UserInscriptions($db);

$id_usuario = isset($_GET['id_usuario']) ? $_GET['id_usuario'] : null;
$id_evento = isset($_GET['id_evento']) ? $_GET['id_evento'] : null;

if ($id_usuario === null || $id_evento === null) {
    echo json_encode(['success' => false, 'message' => 'Faltan parámetros']);
    exit;
}

$inscripciones = $inscObj->getInscriptions($id_usuario, $id_evento);
echo json_encode(['success' => true, 'inscripciones' => $inscripciones]);