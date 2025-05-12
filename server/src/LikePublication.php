<?php
// Permitir CORS para desarrollo
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../conexion.php';

class LikePublication {
    private $conn;
    private $table = "likes_publicaciones";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function toggleLike($id_usuario, $id_publicacion) {
        // Verificar si ya existe el like
        $query = "SELECT id_like FROM {$this->table} WHERE id_usuario = :id_usuario AND id_publicacion = :id_publicacion";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_usuario", $id_usuario);
        $stmt->bindParam(":id_publicacion", $id_publicacion);
        $stmt->execute();
        $like = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($like) {
            // Si existe, eliminar (quitar like)
            $del = $this->conn->prepare("DELETE FROM {$this->table} WHERE id_like = :id_like");
            $del->bindParam(":id_like", $like['id_like']);
            $del->execute();
            $hasUserLiked = false;
        } else {
            // Si no existe, insertar (dar like)
            $ins = $this->conn->prepare("INSERT INTO {$this->table} (id_usuario, id_publicacion) VALUES (:id_usuario, :id_publicacion)");
            $ins->bindParam(":id_usuario", $id_usuario);
            $ins->bindParam(":id_publicacion", $id_publicacion);
            $ins->execute();
            $hasUserLiked = true;
        }

        // Contar likes totales
        $count = $this->conn->prepare("SELECT COUNT(*) FROM {$this->table} WHERE id_publicacion = :id_publicacion");
        $count->bindParam(":id_publicacion", $id_publicacion);
        $count->execute();
        $totalLikes = (int)$count->fetchColumn();

        return [
            'success' => true,
            'hasUserLiked' => $hasUserLiked,
            'likes' => $totalLikes
        ];
    }
}

$database = new Database();
$db = $database->getConnection();
$likeObj = new LikePublication($db);

$id_usuario = $_POST['id_usuario'] ?? null;
$id_publicacion = $_POST['id_publicacion'] ?? null;

if (!$id_usuario || !$id_publicacion) {
    echo json_encode([
        'success' => false,
        'message' => 'Faltan datos requeridos.'
    ]);
    exit;
}

$result = $likeObj->toggleLike($id_usuario, $id_publicacion);
echo json_encode($result); 