<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../conexion.php';

class Users {
    private $conn;
    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function getAll() {
        $stmt = $this->conn->prepare('SELECT id_usuario, nombre, apellido_paterno, apellido_materno, usuario, rol FROM usuarios');
        $stmt->execute();
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode([
            'success' => true,
            'usuarios' => $usuarios
        ]);
    }

    public function create($data) {
        if (!isset($data['nombre'], $data['apellido_paterno'], $data['apellido_materno'], $data['usuario'], $data['contrasena'], $data['rol'])) {
            echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
            return;
        }
        // Validar usuario único
        $stmt = $this->conn->prepare('SELECT COUNT(*) FROM usuarios WHERE usuario = ?');
        $stmt->execute([$data['usuario']]);
        if ($stmt->fetchColumn() > 0) {
            echo json_encode(['success' => false, 'message' => 'El usuario ya existe']);
            return;
        }
        // Guardar contraseña en texto plano (sin hash)
        $stmt = $this->conn->prepare('INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, usuario, contrasena, rol) VALUES (?, ?, ?, ?, ?, ?)');
        $ok = $stmt->execute([
            $data['nombre'],
            $data['apellido_paterno'],
            $data['apellido_materno'],
            $data['usuario'],
            $data['contrasena'],
            $data['rol']
        ]);
        if ($ok) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al crear usuario']);
        }
    }

    public function update($data) {
        if (!isset($data['id_usuario'], $data['nombre'], $data['apellido_paterno'], $data['apellido_materno'], $data['usuario'], $data['rol'])) {
            echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
            return;
        }
        // Validar usuario único (excepto el propio)
        $stmt = $this->conn->prepare('SELECT COUNT(*) FROM usuarios WHERE usuario = ? AND id_usuario != ?');
        $stmt->execute([$data['usuario'], $data['id_usuario']]);
        if ($stmt->fetchColumn() > 0) {
            echo json_encode(['success' => false, 'message' => 'El usuario ya existe']);
            return;
        }
        if (!empty($data['contrasena'])) {
            // Guardar contraseña en texto plano (sin hash)
            $stmt = $this->conn->prepare('UPDATE usuarios SET nombre=?, apellido_paterno=?, apellido_materno=?, usuario=?, contrasena=?, rol=? WHERE id_usuario=?');
            $ok = $stmt->execute([
                $data['nombre'],
                $data['apellido_paterno'],
                $data['apellido_materno'],
                $data['usuario'],
                $data['contrasena'],
                $data['rol'],
                $data['id_usuario']
            ]);
        } else {
            $stmt = $this->conn->prepare('UPDATE usuarios SET nombre=?, apellido_paterno=?, apellido_materno=?, usuario=?, rol=? WHERE id_usuario=?');
            $ok = $stmt->execute([
                $data['nombre'],
                $data['apellido_paterno'],
                $data['apellido_materno'],
                $data['usuario'],
                $data['rol'],
                $data['id_usuario']
            ]);
        }
        if ($ok) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar usuario']);
        }
    }

    public function delete($data) {
        if (!isset($data['id_usuario'])) {
            echo json_encode(['success' => false, 'message' => 'Falta id_usuario']);
            return;
        }
        $stmt = $this->conn->prepare('DELETE FROM usuarios WHERE id_usuario = ?');
        $ok = $stmt->execute([$data['id_usuario']]);
        if ($ok) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar usuario']);
        }
    }

    public function getInscripcionesUsuario($id_usuario) {
        // Obtener todos los eventos
        $stmt = $this->conn->prepare('SELECT id_evento, titulo FROM eventos');
        $stmt->execute();
        $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Obtener eventos en los que el usuario está inscrito
        $stmt = $this->conn->prepare('SELECT id_evento FROM inscripciones WHERE id_usuario = ?');
        $stmt->execute([$id_usuario]);
        $inscritos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode([
            'success' => true,
            'eventos' => $eventos,
            'inscritos' => $inscritos
        ]);
    }

    public function actualizarInscripciones($id_usuario, $eventos) {
        // Eliminar todas las inscripciones actuales
        $stmt = $this->conn->prepare('DELETE FROM inscripciones WHERE id_usuario = ?');
        $stmt->execute([$id_usuario]);
        // Insertar nuevas inscripciones
        if (is_array($eventos) && count($eventos) > 0) {
            $values = [];
            foreach ($eventos as $id_evento) {
                $values[] = "($id_usuario, $id_evento)";
            }
            $sql = 'INSERT INTO inscripciones (id_usuario, id_evento) VALUES ' . implode(',', $values);
            $this->conn->exec($sql);
        }
        echo json_encode(['success' => true]);
    }
}

$users = new Users();
$method = $_SERVER['REQUEST_METHOD'];

// Soporte para GET de inscripciones_usuario
if ($method === 'GET' && isset($_GET['inscripciones_usuario'])) {
    $users->getInscripcionesUsuario($_GET['inscripciones_usuario']);
    exit;
}
// Soporte para POST de actualizar_inscripciones
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['accion']) && $data['accion'] === 'actualizar_inscripciones') {
        $users->actualizarInscripciones($data['id_usuario'], $data['eventos']);
        exit;
    }
}

switch ($method) {
    case 'GET':
        $users->getAll();
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $users->create($data);
        break;
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $users->update($data);
        break;
    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $users->delete($data);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Método no soportado']);
        break;
} 