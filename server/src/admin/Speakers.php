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

class Speakers {
    private $conn;
    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function getAll($nombre = '', $id_evento = null) {
        $params = [];
        $where = [];
        if ($nombre !== '') {
            $where[] = '(e.nombre LIKE ? OR e.apellido_paterno LIKE ? OR e.apellido_materno LIKE ?)';
            $params[] = "%$nombre%";
            $params[] = "%$nombre%";
            $params[] = "%$nombre%";
        }
        if ($id_evento !== null) {
            $where[] = 'ee.id_evento = ?';
            $params[] = $id_evento;
        }
        $whereSql = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT e.*, ee.id_evento, ev.titulo as evento_titulo
                FROM expositores e
                LEFT JOIN evento_expositores ee ON e.id_expositor = ee.id_expositor
                LEFT JOIN eventos ev ON ee.id_evento = ev.id_evento
                $whereSql
                ORDER BY e.nombre, e.apellido_paterno";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Agrupar por expositor
        $expositores = [];
        foreach ($rows as $row) {
            $id = $row['id_expositor'];
            if (!isset($expositores[$id])) {
                $expositores[$id] = [
                    'id_expositor' => $row['id_expositor'],
                    'nombre' => $row['nombre'],
                    'apellido_paterno' => $row['apellido_paterno'],
                    'apellido_materno' => $row['apellido_materno'],
                    'descripcion' => $row['descripcion'],
                    'imagen_url' => $row['imagen_url'],
                    'eventos' => []
                ];
            }
            if ($row['id_evento']) {
                $expositores[$id]['eventos'][] = [
                    'id_evento' => $row['id_evento'],
                    'titulo' => $row['evento_titulo']
                ];
            }
        }
        // Reindexar
        $expositores = array_values($expositores);
        echo json_encode(['success' => true, 'expositores' => $expositores]);
    }

    public function create($data, $file = null) {
        // Si viene id_expositor, hacer update en vez de insert
        if (isset($data['id_expositor'])) {
            $this->update($data, $file);
            return;
        }
        if (!isset($data['nombre'], $data['apellido_paterno'], $data['apellido_materno'], $data['descripcion'], $data['eventos'])) {
            echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
            return;
        }
        $imagen_url = null;
        if ($file && isset($file['tmp_name']) && is_uploaded_file($file['tmp_name'])) {
            $nombreArchivo = uniqid('expo_') . '_' . basename($file['name']);
            $ruta = realpath(__DIR__ . '/../upload/');
            if ($ruta === false) {
                $ruta = __DIR__ . '/../upload/';
                if (!is_dir($ruta)) {
                    mkdir($ruta, 0777, true);
                }
            }
            $destino = rtrim($ruta, '/\\') . DIRECTORY_SEPARATOR . $nombreArchivo;
            if (move_uploaded_file($file['tmp_name'], $destino)) {
                $imagen_url = $nombreArchivo;
            }
        }
        $stmt = $this->conn->prepare('INSERT INTO expositores (nombre, apellido_paterno, apellido_materno, descripcion, imagen_url) VALUES (?, ?, ?, ?, ?)');
        $ok = $stmt->execute([
            $data['nombre'],
            $data['apellido_paterno'],
            $data['apellido_materno'],
            $data['descripcion'],
            $imagen_url
        ]);
        if ($ok) {
            $id_expositor = $this->conn->lastInsertId();
            // Insertar eventos asociados
            if (is_array($data['eventos'])) {
                foreach ($data['eventos'] as $id_evento) {
                    $stmt2 = $this->conn->prepare('INSERT INTO evento_expositores (id_evento, id_expositor) VALUES (?, ?)');
                    $stmt2->execute([$id_evento, $id_expositor]);
                }
            }
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al crear expositor']);
        }
    }

    public function update($data, $file = null) {
        if (!isset($data['id_expositor'], $data['nombre'], $data['apellido_paterno'], $data['apellido_materno'], $data['descripcion'], $data['eventos'])) {
            echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
            return;
        }
        // Obtener imagen anterior
        $stmt = $this->conn->prepare('SELECT imagen_url FROM expositores WHERE id_expositor = ?');
        $stmt->execute([$data['id_expositor']]);
        $row = $stmt->fetch();
        $imagen_url = $row ? $row['imagen_url'] : null;
        // Si hay nueva imagen, subir y eliminar la anterior
        if ($file && isset($file['tmp_name']) && is_uploaded_file($file['tmp_name'])) {
            $nombreArchivo = uniqid('expo_') . '_' . basename($file['name']);
            $ruta = realpath(__DIR__ . '/../upload/');
            if ($ruta === false) {
                $ruta = __DIR__ . '/../upload/';
                if (!is_dir($ruta)) {
                    mkdir($ruta, 0777, true);
                }
            }
            $destino = rtrim($ruta, '/\\') . DIRECTORY_SEPARATOR . $nombreArchivo;
            if (move_uploaded_file($file['tmp_name'], $destino)) {
                // Eliminar anterior
                if ($imagen_url) {
                    $anterior = rtrim($ruta, '/\\') . DIRECTORY_SEPARATOR . $imagen_url;
                    if (file_exists($anterior)) {
                        @unlink($anterior);
                    }
                }
                $imagen_url = $nombreArchivo;
            }
        }
        $stmt = $this->conn->prepare('UPDATE expositores SET nombre=?, apellido_paterno=?, apellido_materno=?, descripcion=?, imagen_url=? WHERE id_expositor=?');
        $ok = $stmt->execute([
            $data['nombre'],
            $data['apellido_paterno'],
            $data['apellido_materno'],
            $data['descripcion'],
            $imagen_url,
            $data['id_expositor']
        ]);
        // Actualizar eventos asociados
        $stmt = $this->conn->prepare('DELETE FROM evento_expositores WHERE id_expositor = ?');
        $stmt->execute([$data['id_expositor']]);
        if (is_array($data['eventos'])) {
            foreach ($data['eventos'] as $id_evento) {
                $stmt2 = $this->conn->prepare('INSERT INTO evento_expositores (id_evento, id_expositor) VALUES (?, ?)');
                $stmt2->execute([$id_evento, $data['id_expositor']]);
            }
        }
        if ($ok) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar expositor']);
        }
    }

    public function delete($id_expositor) {
        // Obtener imagen
        $stmt = $this->conn->prepare('SELECT imagen_url FROM expositores WHERE id_expositor = ?');
        $stmt->execute([$id_expositor]);
        $row = $stmt->fetch();
        $imagen_url = $row ? $row['imagen_url'] : null;
        // Eliminar expositor
        $stmt = $this->conn->prepare('DELETE FROM expositores WHERE id_expositor = ?');
        $ok = $stmt->execute([$id_expositor]);
        // Eliminar imagen
        if ($ok && $imagen_url) {
            $ruta = realpath(__DIR__ . '/../upload/');
            if ($ruta === false) {
                $ruta = __DIR__ . '/../upload/';
            }
            $archivo = rtrim($ruta, '/\\') . DIRECTORY_SEPARATOR . $imagen_url;
            if (file_exists($archivo)) {
                @unlink($archivo);
            }
        }
        if ($ok) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar expositor']);
        }
    }
}

$speakers = new Speakers();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $nombre = isset($_GET['nombre']) ? $_GET['nombre'] : '';
    $id_evento = isset($_GET['id_evento']) ? $_GET['id_evento'] : null;
    if ($id_evento !== null && $id_evento !== '') {
        $id_evento = intval($id_evento);
    } else {
        $id_evento = null;
    }
    $speakers->getAll($nombre, $id_evento);
    exit;
}
if ($method === 'POST') {
    if (isset($_FILES['imagen'])) {
        $data = $_POST;
        $data['eventos'] = isset($data['eventos']) ? json_decode($data['eventos'], true) : [];
        $speakers->create($data, $_FILES['imagen']);
        exit;
    } else {
        $data = json_decode(file_get_contents('php://input'), true);
        $speakers->create($data, null);
        exit;
    }
}
if ($method === 'PUT') {
    // PUT no soporta multipart/form-data, así que la imagen debe subirse por separado o usar POST con un campo especial
    $data = json_decode(file_get_contents('php://input'), true);
    $speakers->update($data, null);
    exit;
}
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['id_expositor'])) {
        $speakers->delete($data['id_expositor']);
        exit;
    }
}
echo json_encode(['success' => false, 'message' => 'Método no soportado']); 