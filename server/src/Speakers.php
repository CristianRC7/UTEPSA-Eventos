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

class Speakers {
    private $conn;
    private $table_name = "expositores";
    private $relation_table = "evento_expositores";
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function getSpeakersByEventId($eventId) {
        // Validar que el ID del evento sea un entero
        if (!is_numeric($eventId)) {
            return [
                'success' => false,
                'message' => 'ID de evento inválido'
            ];
        }
        
        // Construir la consulta SQL para obtener los expositores de un evento específico
        $query = "SELECT e.* 
                 FROM " . $this->table_name . " e
                 INNER JOIN " . $this->relation_table . " re ON e.id_expositor = re.id_expositor
                 WHERE re.id_evento = :event_id
                 ORDER BY e.nombre ASC";
        
        // Preparar la sentencia
        $stmt = $this->conn->prepare($query);
        
        // Vincular el parámetro
        $stmt->bindParam(":event_id", $eventId);
        
        // Ejecutar la consulta
        $stmt->execute();
        
        // Verificar si se encontraron expositores
        if ($stmt->rowCount() > 0) {
            // Devolver los expositores encontrados
            $speakers = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $speakers[] = $row;
            }
            
            return [
                'success' => true,
                'speakers' => $speakers
            ];
        } else {
            return [
                'success' => false,
                'message' => 'No se encontraron expositores',
                'speakers' => []
            ];
        }
    }
}

// Procesar la solicitud
$database = new Database();
$db = $database->getConnection();
$speakersObj = new Speakers($db);

// Obtener el ID del evento de la URL
$eventId = isset($_GET['event_id']) ? $_GET['event_id'] : null;

if ($eventId === null) {
    echo json_encode([
        'success' => false,
        'message' => 'Se requiere el ID del evento',
        'speakers' => []
    ]);
    exit;
}

// Realizar la búsqueda
$result = $speakersObj->getSpeakersByEventId($eventId);

// Devolver la respuesta
echo json_encode($result);
?>
