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

class Publication {
    private $conn;
    private $table_publicacion = "publicaciones";
    private $table_imagen = "imagenes_publicacion";
    private $img_dir = __DIR__ . "/publication_img/";

    public function __construct($db) {
        $this->conn = $db;
        if (!is_dir($this->img_dir)) {
            mkdir($this->img_dir, 0777, true);
        }
    }

    public function create($id_usuario, $id_evento, $descripcion, $imagenes) {
        if (!is_numeric($id_usuario) || !is_numeric($id_evento)) {
            return [ 'success' => false, 'message' => 'Datos inválidos.' ];
        }
        // Insertar publicación con descripción
        $query = "INSERT INTO {$this->table_publicacion} (id_usuario, id_evento, descripcion, estado) VALUES (:id_usuario, :id_evento, :descripcion, 'esperando_aprobacion')";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_usuario", $id_usuario);
        $stmt->bindParam(":id_evento", $id_evento);
        $stmt->bindParam(":descripcion", $descripcion);
        if (!$stmt->execute()) {
            return [ 'success' => false, 'message' => 'No se pudo crear la publicación.' ];
        }
        $id_publicacion = $this->conn->lastInsertId();
        // Guardar imágenes
        $img_urls = [];
        foreach ($imagenes as $img) {
            if (!isset($img['tmp_name']) || !is_uploaded_file($img['tmp_name'])) continue;
            $ext = pathinfo($img['name'], PATHINFO_EXTENSION);
            $file_name = uniqid('pub_', true) . "." . $ext;
            $dest_path = $this->img_dir . $file_name;
            if (move_uploaded_file($img['tmp_name'], $dest_path)) {
                $img_url = "publication_img/" . $file_name;
                $img_urls[] = $img_url;
                // Insertar en imagenes_publicacion
                $query_img = "INSERT INTO {$this->table_imagen} (id_publicacion, imagen_url) VALUES (:id_publicacion, :imagen_url)";
                $stmt_img = $this->conn->prepare($query_img);
                $stmt_img->bindParam(":id_publicacion", $id_publicacion);
                $stmt_img->bindParam(":imagen_url", $img_url);
                $stmt_img->execute();
            }
        }
        return [ 'success' => true, 'message' => 'Publicación enviada correctamente.', 'imagenes' => $img_urls ];
    }
}

$database = new Database();
$db = $database->getConnection();
$publicationObj = new Publication($db);

$id_usuario = $_POST['id_usuario'] ?? null;
$id_evento = $_POST['id_evento'] ?? null;
$descripcion = $_POST['descripcion'] ?? '';
$imagenes = $_FILES['imagenes'] ?? null;

// Normalizar imágenes (pueden venir como array o como un solo archivo)
$imagenes_array = [];
if ($imagenes) {
    if (is_array($imagenes['name'])) {
        for ($i = 0; $i < count($imagenes['name']); $i++) {
            $imagenes_array[] = [
                'name' => $imagenes['name'][$i],
                'type' => $imagenes['type'][$i],
                'tmp_name' => $imagenes['tmp_name'][$i],
                'error' => $imagenes['error'][$i],
                'size' => $imagenes['size'][$i],
            ];
        }
    } else {
        $imagenes_array[] = $imagenes;
    }
}

if ($id_usuario === null || $id_evento === null || empty($imagenes_array)) {
    echo json_encode([
        'success' => false,
        'message' => 'Faltan datos requeridos o imágenes.'
    ]);
    exit;
}

$result = $publicationObj->create($id_usuario, $id_evento, $descripcion, $imagenes_array);
echo json_encode($result); 