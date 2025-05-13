<?php
// Permitir CORS para desarrollo
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../conexion.php';

class MyPublications {
    private $conn;
    private $imgDir;
    //private $baseImgUrl;
    public function __construct($db, $imgDir) {
        $this->conn = $db;
        $this->imgDir = $imgDir;
        //$this->baseImgUrl = $baseImgUrl;
    }

    // Obtener publicaciones del usuario
    public function getUserPublications($id_usuario) {
        $sql = "SELECT p.id_publicacion, p.fecha_subida, p.id_evento, p.id_usuario, p.descripcion AS publicationDescription, p.estado,
                        u.nombre AS userName, e.titulo AS eventName, e.descripcion AS eventDescription
                FROM publicaciones p
                JOIN usuarios u ON p.id_usuario = u.id_usuario
                JOIN eventos e ON p.id_evento = e.id_evento
                WHERE p.id_usuario = ?
                ORDER BY p.fecha_subida DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$id_usuario]);
        $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $result = [];
        foreach ($publicaciones as $pub) {
            // Imágenes
            $sql_imgs = "SELECT imagen_url FROM imagenes_publicacion WHERE id_publicacion = ?";
            $stmt_imgs = $this->conn->prepare($sql_imgs);
            $stmt_imgs->execute([$pub['id_publicacion']]);
            $imagenes = $stmt_imgs->fetchAll(PDO::FETCH_COLUMN);
            // No modificar $imagenes, ya contiene solo la ruta relativa
            // Likes
            $sql_likes = "SELECT COUNT(*) FROM likes_publicaciones WHERE id_publicacion = ?";
            $stmt_likes = $this->conn->prepare($sql_likes);
            $stmt_likes->execute([$pub['id_publicacion']]);
            $likes = (int)$stmt_likes->fetchColumn();
            $result[] = [
                'id' => (int)$pub['id_publicacion'],
                'userName' => $pub['userName'],
                'eventName' => $pub['eventName'],
                'eventDescription' => $pub['eventDescription'],
                'publicationDescription' => $pub['publicationDescription'],
                'date' => $pub['fecha_subida'],
                'imageUrls' => $imagenes,
                'likes' => $likes,
                'estado' => $pub['estado'],
                'id_evento' => $pub['id_evento'],
            ];
        }
        return $result;
    }

    // Editar publicación (evento y descripción)
    public function editPublication($id_publicacion, $id_evento, $descripcion) {
        $sql = "UPDATE publicaciones SET id_evento = ?, descripcion = ?, estado = 'esperando_aprobacion' WHERE id_publicacion = ?";
        $stmt = $this->conn->prepare($sql);
        $ok = $stmt->execute([$id_evento, $descripcion, $id_publicacion]);
        return $ok;
    }

    // Eliminar publicación (y sus imágenes y likes)
    public function deletePublication($id_publicacion) {
        // Obtener imágenes
        $sql_imgs = "SELECT imagen_url FROM imagenes_publicacion WHERE id_publicacion = ?";
        $stmt_imgs = $this->conn->prepare($sql_imgs);
        $stmt_imgs->execute([$id_publicacion]);
        $imagenes = $stmt_imgs->fetchAll(PDO::FETCH_COLUMN);
        // Eliminar archivos físicos
        foreach ($imagenes as $img) {
            $imgPath = $this->imgDir . basename($img);
            if (file_exists($imgPath)) {
                unlink($imgPath);
            }
        }
        // Eliminar likes
        $this->conn->prepare("DELETE FROM likes_publicaciones WHERE id_publicacion = ?")->execute([$id_publicacion]);
        // Eliminar imágenes
        $this->conn->prepare("DELETE FROM imagenes_publicacion WHERE id_publicacion = ?")->execute([$id_publicacion]);
        // Eliminar publicación
        $ok = $this->conn->prepare("DELETE FROM publicaciones WHERE id_publicacion = ?")->execute([$id_publicacion]);
        return $ok;
    }
}

$database = new Database();
$db = $database->getConnection();
$imgDir = __DIR__ . "/publication_img/";
//$baseImgUrl = 'http://10.40.22.186/UTEPSA-Eventos/server/src/';
$myPubs = new MyPublications($db, $imgDir);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id_usuario = $_GET['id_usuario'] ?? null;
    if (!$id_usuario) {
        echo json_encode(['success' => false, 'message' => 'Falta id_usuario']);
        exit;
    }
    $pubs = $myPubs->getUserPublications($id_usuario);
    echo json_encode(['success' => true, 'publications' => $pubs]);
    exit;
}

if ($method === 'POST') {
    $action = $_POST['action'] ?? null;
    if ($action === 'edit') {
        $id_publicacion = $_POST['id_publicacion'] ?? null;
        $id_evento = $_POST['id_evento'] ?? null;
        $descripcion = $_POST['descripcion'] ?? '';
        if (!$id_publicacion || !$id_evento) {
            echo json_encode(['success' => false, 'message' => 'Faltan datos para editar']);
            exit;
        }
        $ok = $myPubs->editPublication($id_publicacion, $id_evento, $descripcion);
        echo json_encode(['success' => $ok]);
        exit;
    }
    if ($action === 'delete') {
        $id_publicacion = $_POST['id_publicacion'] ?? null;
        if (!$id_publicacion) {
            echo json_encode(['success' => false, 'message' => 'Falta id_publicacion para eliminar']);
            exit;
        }
        $ok = $myPubs->deletePublication($id_publicacion);
        echo json_encode(['success' => $ok]);
        exit;
    }
}

echo json_encode(['success' => false, 'message' => 'Acción no válida']); 