<?php
// Permitir CORS para desarrollo
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Manejar solicitud OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Incluir el archivo de conexión
require_once '../conexion.php';

class Events {
    private $conn;
    private $table_name = "eventos";
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function searchEvents($searchTerm = '') {
        // Construir la consulta SQL base
        $query = "SELECT e.id_evento, e.titulo, e.descripcion, e.fecha_inicio, e.fecha_fin, w.url_web as pagina_web 
                 FROM " . $this->table_name . " e
                 LEFT JOIN web_evento w ON e.id_evento = w.id_evento";
        
        // Si hay un término de búsqueda, añadir la condición WHERE
        if (!empty($searchTerm)) {
            $query .= " WHERE e.titulo LIKE :search 
                      OR e.descripcion LIKE :search 
                      ORDER BY e.fecha_inicio DESC"; // Ordenar descendente (más reciente primero)
        } else {
            // Si no hay término de búsqueda, ordenar por fecha de inicio descendente (más reciente primero)
            $query .= " ORDER BY e.fecha_inicio DESC";
        }
        
        // Preparar la sentencia
        $stmt = $this->conn->prepare($query);
        
        // Si hay un término de búsqueda, vincular el parámetro
        if (!empty($searchTerm)) {
            $searchParam = "%" . $searchTerm . "%";
            $stmt->bindParam(":search", $searchParam);
        }
        
        // Ejecutar la consulta
        $stmt->execute();
        
        // Verificar si se encontraron eventos
        if ($stmt->rowCount() > 0) {
            // Devolver los eventos encontrados
            $events = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $events[] = $row;
            }
            
            return [
                'success' => true,
                'events' => $events
            ];
        } else {
            return [
                'success' => false,
                'message' => 'No se encontraron eventos',
                'events' => []
            ];
        }
    }
}

// Procesar la solicitud
$database = new Database();
$db = $database->getConnection();
$eventsObj = new Events($db);

// Obtener el término de búsqueda de la URL
$searchTerm = isset($_GET['search']) ? $_GET['search'] : '';

// Realizar la búsqueda
$result = $eventsObj->searchEvents($searchTerm);

// Devolver la respuesta
echo json_encode($result);
?>
