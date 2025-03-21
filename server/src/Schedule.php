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

class Schedule {
    private $conn;
    private $table_name = "cronograma_eventos";
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function getScheduleByEventId($eventId) {
        // Validar que el ID del evento sea un entero
        if (!is_numeric($eventId)) {
            return [
                'success' => false,
                'message' => 'ID de evento inválido'
            ];
        }
        
        // Construir la consulta SQL para obtener las actividades de un evento específico
        $query = "SELECT id_actividad, titulo, descripcion, fecha, hora, ubicacion, inscripcion_habilitada 
                 FROM " . $this->table_name . " 
                 WHERE id_evento = :event_id 
                 ORDER BY fecha ASC, hora ASC";
        
        // Preparar la sentencia
        $stmt = $this->conn->prepare($query);
        
        // Vincular el parámetro
        $stmt->bindParam(":event_id", $eventId);
        
        // Ejecutar la consulta
        $stmt->execute();
        
        // Verificar si se encontraron actividades
        if ($stmt->rowCount() > 0) {
            // Devolver las actividades encontradas
            $activities = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $activities[] = $row;
            }
            
            return [
                'success' => true,
                'activities' => $activities
            ];
        } else {
            return [
                'success' => false,
                'message' => 'No se encontraron actividades',
                'activities' => []
            ];
        }
    }
}

// Procesar la solicitud
$database = new Database();
$db = $database->getConnection();
$scheduleObj = new Schedule($db);

// Obtener el ID del evento de la URL
$eventId = isset($_GET['event_id']) ? $_GET['event_id'] : null;

if ($eventId === null) {
    echo json_encode([
        'success' => false,
        'message' => 'Se requiere el ID del evento',
        'activities' => []
    ]);
    exit;
}

// Obtener el cronograma
$result = $scheduleObj->getScheduleByEventId($eventId);

// Devolver la respuesta
echo json_encode($result);
?>
