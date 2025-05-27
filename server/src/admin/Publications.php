<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../conexion.php';

class Publications {
    private $conn;
    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function getAll($filtros = []) {
        $where = [];
        $params = [];
        if (!empty($filtros['usuario'])) {
            $where[] = 'u.usuario LIKE ?';
            $params[] = '%' . $filtros['usuario'] . '%';
        }
        if (!empty($filtros['evento'])) {
            $where[] = 'e.titulo LIKE ?';
            $params[] = '%' . $filtros['evento'] . '%';
        }
        if (!empty($filtros['estado'])) {
            $where[] = 'p.estado = ?';
            $params[] = $filtros['estado'];
        }
        $sql = 'SELECT p.id_publicacion, p.descripcion, p.estado, p.fecha_subida, u.usuario, e.titulo as evento
                FROM publicaciones p
                JOIN usuarios u ON p.id_usuario = u.id_usuario
                JOIN eventos e ON p.id_evento = e.id_evento';
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY p.fecha_subida DESC';
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Obtener imágenes por publicación
        foreach ($publicaciones as &$pub) {
            $stmt2 = $this->conn->prepare('SELECT imagen_url FROM imagenes_publicacion WHERE id_publicacion = ?');
            $stmt2->execute([$pub['id_publicacion']]);
            $pub['imagenes'] = array_map(function($row) { return $row['imagen_url']; }, $stmt2->fetchAll(PDO::FETCH_ASSOC));
        }
        echo json_encode([
            'success' => true,
            'publicaciones' => $publicaciones
        ]);
    }

    public function updateEstado($id_publicacion, $accion) {
        $nuevo_estado = $accion === 'aceptar' ? 'aprobado' : ($accion === 'rechazar' ? 'rechazado' : null);
        if (!$nuevo_estado) {
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
            return;
        }
        $stmt = $this->conn->prepare('UPDATE publicaciones SET estado = ? WHERE id_publicacion = ?');
        $ok = $stmt->execute([$nuevo_estado, $id_publicacion]);
        if ($ok) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se pudo actualizar la publicación']);
        }
    }
}

$pubs = new Publications();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $filtros = [
        'usuario' => $_GET['usuario'] ?? '',
        'evento' => $_GET['evento'] ?? '',
        'estado' => $_GET['estado'] ?? ''
    ];
    $pubs->getAll($filtros);
    exit;
}
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['accion'], $data['id_publicacion'])) {
        $pubs->updateEstado($data['id_publicacion'], $data['accion']);
        exit;
    }
}
echo json_encode(['success' => false, 'message' => 'Método o datos no válidos']); 