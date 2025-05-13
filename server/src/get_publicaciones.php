<?php
// Permitir CORS para desarrollo
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../conexion.php';

class PublicationList {
    private $conn;
    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll($id_usuario = null, $baseImgUrl = '') {
        $sql = "SELECT p.id_publicacion, p.fecha_subida, p.id_evento, p.id_usuario,
                      p.descripcion AS publicationDescription,
                      u.nombre AS userName, e.titulo AS eventName, e.descripcion AS eventDescription
                FROM publicaciones p
                JOIN usuarios u ON p.id_usuario = u.id_usuario
                JOIN eventos e ON p.id_evento = e.id_evento
                WHERE p.estado = 'aprobado'
                ORDER BY p.fecha_subida DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $result = [];
        foreach ($publicaciones as $pub) {
            // Obtener imágenes
            $sql_imgs = "SELECT imagen_url FROM imagenes_publicacion WHERE id_publicacion = ?";
            $stmt_imgs = $this->conn->prepare($sql_imgs);
            $stmt_imgs->execute([$pub['id_publicacion']]);
            $imagenes = $stmt_imgs->fetchAll(PDO::FETCH_COLUMN);
            // No modificar $imagenes, ya contiene solo la ruta relativa

            // Contar likes
            $sql_likes = "SELECT COUNT(*) FROM likes_publicaciones WHERE id_publicacion = ?";
            $stmt_likes = $this->conn->prepare($sql_likes);
            $stmt_likes->execute([$pub['id_publicacion']]);
            $likes = (int)$stmt_likes->fetchColumn();

            // Saber si el usuario actual le dio like
            $hasUserLiked = false;
            if ($id_usuario) {
                $sql_user_like = "SELECT 1 FROM likes_publicaciones WHERE id_publicacion = ? AND id_usuario = ?";
                $stmt_user_like = $this->conn->prepare($sql_user_like);
                $stmt_user_like->execute([$pub['id_publicacion'], $id_usuario]);
                $hasUserLiked = $stmt_user_like->fetchColumn() ? true : false;
            }

            $result[] = [
                'id' => (int)$pub['id_publicacion'],
                'userName' => $pub['userName'],
                'eventName' => $pub['eventName'],
                'eventDescription' => $pub['eventDescription'],
                'publicationDescription' => $pub['publicationDescription'],
                'date' => $pub['fecha_subida'],
                'imageUrls' => $imagenes,
                'likes' => $likes,
                'hasUserLiked' => $hasUserLiked
            ];
        }
        return $result;
    }
}

$database = new Database();
$db = $database->getConnection();
$publicationList = new PublicationList($db);

$id_usuario = $_GET['id_usuario'] ?? $_POST['id_usuario'] ?? null;

//$baseImgUrl = 'http://10.40.23.87/UTEPSA-Eventos/server/src/';

$publications = $publicationList->getAll($id_usuario);
echo json_encode([
    'success' => true,
    'publications' => $publications
]); 