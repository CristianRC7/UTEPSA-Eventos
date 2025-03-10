<?php
// Permitir CORS para desarrollo
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
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
        // Si no hay término de búsqueda, obtener todos los eventos
        if (empty($searchTerm)) {
            $query = "SELECT id_evento, titulo, descripcion, fecha_inicio, fecha_fin, pagina_web 
                      FROM " . $this->table_name . " 
                      ORDER BY fecha_inicio DESC";
            
            $stmt = $this->conn->prepare($query);
        } else {
            // Si hay término de búsqueda, filtrar eventos por título
            $query = "SELECT id_evento, titulo, descripcion, fecha_inicio, fecha_fin, pagina_web 
                      FROM " . $this->table_name . " 
                      WHERE titulo LIKE :searchTerm 
                      ORDER BY fecha_inicio DESC";
            
            $stmt = $this->conn->prepare($query);
            
            // Sanitizar y preparar el término de búsqueda
            $searchTerm = htmlspecialchars(strip_tags($searchTerm));
            $searchTerm = "%{$searchTerm}%";
            
            // Vincular parámetro
            $stmt->bindParam(":searchTerm", $searchTerm);
        }
        
        // Ejecutar consulta
        $stmt->execute();
        
        // Verificar si se encontraron eventos
        $num = $stmt->rowCount();
        
        if ($num > 0) {
            $events_arr = array();
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // Formatear las fechas
                $fecha_inicio = date("d/m/Y H:i", strtotime($row['fecha_inicio']));
                $fecha_fin = date("d/m/Y H:i", strtotime($row['fecha_fin']));
                
                $event_item = array(
                    'id_evento' => $row['id_evento'],
                    'titulo' => $row['titulo'],
                    'descripcion' => $row['descripcion'],
                    'fecha_inicio' => $fecha_inicio,
                    'fecha_fin' => $fecha_fin,
                    'pagina_web' => $row['pagina_web']
                );
                
                array_push($events_arr, $event_item);
            }
            
            return [
                'success' => true,
                'events' => $events_arr
            ];
        } else {
            return [
                'success' => false,
                'message' => 'No se encontraron eventos'
            ];
        }
    }
}

// Inicializar la conexión a la base de datos
$database = new Database();
$db = $database->getConnection();
$events = new Events($db);

// Determinar el método de solicitud
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener el término de búsqueda si existe
    $searchTerm = isset($_GET['search']) ? $_GET['search'] : '';
    
    // Buscar eventos
    $result = $events->searchEvents($searchTerm);
    
    // Devolver la respuesta
    echo json_encode($result);
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener los datos enviados
    $data = json_decode(file_get_contents("php://input"));
    
    // Verificar que se recibió el término de búsqueda
    $searchTerm = isset($data->search) ? $data->search : '';
    
    // Buscar eventos
    $result = $events->searchEvents($searchTerm);
    
    // Devolver la respuesta
    echo json_encode($result);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Método no permitido"
    ]);
}
?>
