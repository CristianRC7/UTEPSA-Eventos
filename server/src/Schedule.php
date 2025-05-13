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
    
    public function getScheduleByEventId($eventId, $id_usuario = null) {
        // Validar que el ID del evento sea un entero
        if (!is_numeric($eventId)) {
            return [
                'success' => false,
                'message' => 'ID de evento inválido'
            ];
        }
        
        // Verificar si el usuario está inscrito en el evento
        $userInscrito = false;
        $actividadesInscritas = [];
        if ($id_usuario) {
            $sqlCheck = "SELECT 1 FROM inscripciones WHERE id_usuario = ? AND id_evento = ?";
            $stmtCheck = $this->conn->prepare($sqlCheck);
            $stmtCheck->execute([$id_usuario, $eventId]);
            $userInscrito = $stmtCheck->fetchColumn() ? true : false;

            // Obtener actividades a las que el usuario está inscrito
            $sqlAct = "SELECT id_actividad FROM inscripcion_actividades WHERE id_usuario = ?";
            $stmtAct = $this->conn->prepare($sqlAct);
            $stmtAct->execute([$id_usuario]);
            $actividadesInscritas = $stmtAct->fetchAll(PDO::FETCH_COLUMN, 0);
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
        $activities = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Si el usuario no está inscrito, forzar inscripcion_habilitada a false
            if (!$userInscrito) {
                $row['inscripcion_habilitada'] = false;
            }
            // Agregar campo 'inscrito' si el usuario está inscrito a la actividad
            $row['inscrito'] = in_array($row['id_actividad'], $actividadesInscritas);
            $activities[] = $row;
        }
        
        if (count($activities) > 0) {
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
$id_usuario = isset($_GET['id_usuario']) ? $_GET['id_usuario'] : null;

if ($eventId === null) {
    echo json_encode([
        'success' => false,
        'message' => 'Se requiere el ID del evento',
        'activities' => []
    ]);
    exit;
}

// Obtener el cronograma
$result = $scheduleObj->getScheduleByEventId($eventId, $id_usuario);

// Devolver la respuesta
echo json_encode($result);
?>
