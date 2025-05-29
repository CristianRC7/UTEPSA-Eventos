<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, DELETE, OPTIONS');
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
            $id_evento = $this->conn->lastInsertId();
            // Guardar url_web si viene
            if (!empty($data['url_web'])) {
                $stmtWeb = $this->conn->prepare('INSERT INTO web_evento (id_evento, url_web) VALUES (?, ?)');
                $stmtWeb->execute([$id_evento, $data['url_web']]);
            }
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al crear evento']);
        }
    }

    public function update($data) {
        if (!isset($data['id_evento'], $data['titulo'], $data['descripcion'], $data['fecha_inicio'], $data['fecha_fin'])) {
            echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
            return;
        }
        $certificado_img = isset($data['certificado_img']) ? $data['certificado_img'] : null;
        $stmt = $this->conn->prepare('UPDATE eventos SET titulo=?, descripcion=?, fecha_inicio=?, fecha_fin=?, certificado_img=? WHERE id_evento=?');
        $ok = $stmt->execute([
            $data['titulo'],
            $data['descripcion'],
            $data['fecha_inicio'],
            $data['fecha_fin'],
            $certificado_img,
            $data['id_evento']
        ]);
        // Manejar url_web
        if (isset($data['url_web']) && $data['url_web']) {
            // Si ya existe, actualizar, si no, insertar
            $stmtCheck = $this->conn->prepare('SELECT COUNT(*) FROM web_evento WHERE id_evento = ?');
            $stmtCheck->execute([$data['id_evento']]);
            if ($stmtCheck->fetchColumn() > 0) {
                $stmtWeb = $this->conn->prepare('UPDATE web_evento SET url_web = ? WHERE id_evento = ?');
                $stmtWeb->execute([$data['url_web'], $data['id_evento']]);
            } else {
                $stmtWeb = $this->conn->prepare('INSERT INTO web_evento (id_evento, url_web) VALUES (?, ?)');
                $stmtWeb->execute([$data['id_evento'], $data['url_web']]);
            }
        } else if (isset($data['url_web']) && $data['url_web'] === '') {
            // Si se borra el enlace, eliminar registro
            $stmtWeb = $this->conn->prepare('DELETE FROM web_evento WHERE id_evento = ?');
            $stmtWeb->execute([$data['id_evento']]);
        }
        if ($ok) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar evento']);
        }
    }

    public function uploadCertificado($file, $nombreArchivo) {
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

    public function deleteCertificado($id_evento) {
        // Obtener nombre del archivo
        $stmt = $this->conn->prepare('SELECT certificado_img FROM eventos WHERE id_evento = ?');
        $stmt->execute([$id_evento]);
        $row = $stmt->fetch();
        if ($row && $row['certificado_img']) {
            $file = realpath(__DIR__ . '/../../src/certificate/') . DIRECTORY_SEPARATOR . $row['certificado_img'];
            if (file_exists($file)) {
                @unlink($file);
            }
        }
        // Actualizar campo en la BD
        $stmt = $this->conn->prepare('UPDATE eventos SET certificado_img = NULL WHERE id_evento = ?');
        $stmt->execute([$id_evento]);
        echo json_encode(['success' => true]);
    }

    public function delete($id_evento) {
        // Obtener nombre del archivo certificado
        $stmt = $this->conn->prepare('SELECT certificado_img FROM eventos WHERE id_evento = ?');
        $stmt->execute([$id_evento]);
        $row = $stmt->fetch();
        if ($row && $row['certificado_img']) {
            $file = realpath(__DIR__ . '/../../src/certificate/') . DIRECTORY_SEPARATOR . $row['certificado_img'];
            if (file_exists($file)) {
                @unlink($file);
            }
        }
        // Eliminar cronogramas asociados
        $stmt = $this->conn->prepare('DELETE FROM cronograma_eventos WHERE id_evento = ?');
        $stmt->execute([$id_evento]);
        // Eliminar el evento
        $stmt = $this->conn->prepare('DELETE FROM eventos WHERE id_evento = ?');
        $ok = $stmt->execute([$id_evento]);
        if ($ok) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar evento']);
        }
    }

    // --- NUEVO: CRUD de actividades del cronograma ---
    public function crearActividad($data) {
        if (!isset($data['id_evento'], $data['titulo'], $data['descripcion'], $data['fecha'], $data['hora'], $data['ubicacion'], $data['inscripcion_habilitada'])) {
            echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
            return;
        }
        $stmt = $this->conn->prepare('INSERT INTO cronograma_eventos (id_evento, titulo, descripcion, fecha, hora, ubicacion, inscripcion_habilitada) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $ok = $stmt->execute([
            $data['id_evento'],
            $data['titulo'],
            $data['descripcion'],
            $data['fecha'],
            $data['hora'],
            $data['ubicacion'],
            (int)$data['inscripcion_habilitada']
        ]);
        if ($ok) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al crear actividad']);
        }
    }
    public function editarActividad($data) {
        if (!isset($data['id_actividad'], $data['titulo'], $data['descripcion'], $data['fecha'], $data['hora'], $data['ubicacion'], $data['inscripcion_habilitada'])) {
            echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
            return;
        }
        $stmt = $this->conn->prepare('UPDATE cronograma_eventos SET titulo=?, descripcion=?, fecha=?, hora=?, ubicacion=?, inscripcion_habilitada=? WHERE id_actividad=?');
        $ok = $stmt->execute([
            $data['titulo'],
            $data['descripcion'],
            $data['fecha'],
            $data['hora'],
            $data['ubicacion'],
            (int)$data['inscripcion_habilitada'],
            $data['id_actividad']
        ]);
        if ($ok) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al editar actividad']);
        }
    }

    public function eliminarActividad($data) {
        $id_actividad = $data['id_actividad'] ?? null;
        if (!$id_actividad) {
            echo json_encode(['success' => false, 'message' => 'Falta id_actividad']);
            return;
        }
        // Eliminar inscripciones a la actividad
        $stmt = $this->conn->prepare('DELETE FROM inscripcion_actividades WHERE id_actividad = ?');
        $stmt->execute([$id_actividad]);
        // Eliminar formularios asociados a la actividad
        $stmt = $this->conn->prepare('DELETE FROM formularios WHERE id_actividad = ?');
        $stmt->execute([$id_actividad]);
        // Eliminar habilitaciones de formularios
        $stmt = $this->conn->prepare('DELETE FROM habilitacion_formularios WHERE id_actividad = ?');
        $stmt->execute([$id_actividad]);
        // Finalmente, eliminar la actividad
        $stmt = $this->conn->prepare('DELETE FROM cronograma_eventos WHERE id_actividad = ?');
        $ok = $stmt->execute([$id_actividad]);
        if ($ok) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar actividad']);
        }
    }

    // --- NUEVO: Habilitación de formularios por actividad ---
    public function setHabilitacionFormulario($data) {
        if (!isset($data['id_actividad'], $data['fecha_inicio'], $data['fecha_fin'])) {
            echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
            return;
        }
        // Verificar si ya existe habilitación para la actividad
        $stmt = $this->conn->prepare('SELECT COUNT(*) FROM habilitacion_formularios WHERE id_actividad = ?');
        $stmt->execute([$data['id_actividad']]);
        if ($stmt->fetchColumn() > 0) {
            // Actualizar
            $stmtUp = $this->conn->prepare('UPDATE habilitacion_formularios SET fecha_inicio=?, fecha_fin=? WHERE id_actividad=?');
            $ok = $stmtUp->execute([
                $data['fecha_inicio'],
                $data['fecha_fin'],
                $data['id_actividad']
            ]);
        } else {
            // Insertar
            $stmtIn = $this->conn->prepare('INSERT INTO habilitacion_formularios (id_actividad, fecha_inicio, fecha_fin) VALUES (?, ?, ?)');
            $ok = $stmtIn->execute([
                $data['id_actividad'],
                $data['fecha_inicio'],
                $data['fecha_fin']
            ]);
        }
        if ($ok) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al guardar habilitación']);
        }
    }

    public function getHabilitacionFormulario($id_actividad) {
        $stmt = $this->conn->prepare('SELECT * FROM habilitacion_formularios WHERE id_actividad = ? LIMIT 1');
        $stmt->execute([$id_actividad]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            echo json_encode(['success' => true, 'habilitacion' => $row]);
        } else {
            echo json_encode(['success' => true, 'habilitacion' => null]);
        }
    }
}

$events = new Events();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Subida de archivo
    if (isset($_FILES['certificado'])) {
        $nombreArchivo = $_FILES['certificado']['name'];
        $events->uploadCertificado($_FILES['certificado'], $nombreArchivo);
        exit;
    }
    $data = json_decode(file_get_contents('php://input'), true);
    // Eliminar certificado
    if (isset($data['accion']) && $data['accion'] === 'eliminar_certificado' && isset($data['id_evento'])) {
        $events->deleteCertificado($data['id_evento']);
        exit;
    }
    // Eliminar evento
    if (isset($data['accion']) && $data['accion'] === 'eliminar_evento' && isset($data['id_evento'])) {
        $events->delete($data['id_evento']);
        exit;
    }
    // Crear actividad
    if (isset($data['accion']) && $data['accion'] === 'crear_actividad') {
        $events->crearActividad($data);
        exit;
    }
    // Eliminar actividad
    if (isset($data['accion']) && $data['accion'] === 'eliminar_actividad') {
        $events->eliminarActividad($data);
        exit;
    }
    // Habilitar formulario para actividad
    if (isset($data['accion']) && $data['accion'] === 'habilitar_formulario') {
        $events->setHabilitacionFormulario($data);
        exit;
    }
    // Crear evento
    $events->create($data);
    exit;
}
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    // Editar actividad
    if (isset($data['accion']) && $data['accion'] === 'editar_actividad') {
        $events->editarActividad($data);
        exit;
    }
    $events->update($data);
    exit;
}
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    // Eliminar actividad
    if (isset($data['accion']) && $data['accion'] === 'eliminar_actividad') {
        $events->eliminarActividad($data);
        exit;
    }
    if (isset($data['id_evento'])) {
        $events->delete($data['id_evento']);
        exit;
    }
}
if ($method === 'GET') {
    if (isset($_GET['accion']) && $_GET['accion'] === 'get_habilitacion_formulario' && isset($_GET['id_actividad'])) {
        $events->getHabilitacionFormulario($_GET['id_actividad']);
        exit;
    }
}
echo json_encode(['success' => false, 'message' => 'Método no soportado']); 