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

class UserCertificates {
    private $conn;
    public function __construct($db) {
        $this->conn = $db;
    }

    public function getCertificates($id_usuario) {
        $sql = "SELECT c.id_certificado, c.nro_certificado, e.titulo AS nombre_evento, e.certificado_img
                FROM certificados c
                JOIN inscripciones i ON c.id_inscripcion = i.id_inscripcion
                JOIN eventos e ON i.id_evento = e.id_evento
                WHERE i.id_usuario = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$id_usuario]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

$database = new Database();
$db = $database->getConnection();
$certObj = new UserCertificates($db);

$id_usuario = isset($_GET['id_usuario']) ? $_GET['id_usuario'] : null;

if ($id_usuario === null) {
    echo json_encode(['success' => false, 'message' => 'Falta id_usuario', 'certificados' => []]);
    exit;
}

$certificados = $certObj->getCertificates($id_usuario);
echo json_encode(['success' => true, 'certificados' => $certificados]); 