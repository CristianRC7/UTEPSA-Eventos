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

class LoginAdmin {
    private $conn;
    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function handle() {
        $input = json_decode(file_get_contents('php://input'), true);
        $usuario = $input['usuario'] ?? '';
        $contrasena = $input['contrasena'] ?? '';

        if (!$usuario || !$contrasena) {
            echo json_encode(['success' => false, 'message' => 'Faltan datos']);
            exit;
        }

        $stmt = $this->conn->prepare('SELECT id_usuario, nombre, apellido_paterno, apellido_materno, usuario, rol, contrasena FROM usuarios WHERE usuario = ? LIMIT 1');
        $stmt->execute([$usuario]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && $user['contrasena'] === $contrasena && $user['rol'] === 'administrador') {
            unset($user['contrasena']);
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Usuario o contraseña incorrectos, o no tienes permisos de administrador.']);
        }
    }
}

$login = new LoginAdmin();
$login->handle();
