<?php
// Permitir CORS para desarrollo
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Manejar solicitud OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Incluir el archivo de conexión
require_once '../conexion.php';

class Login {
    private $conn;
    private $table_name = "usuarios";
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function authenticate($usuario, $contrasena) {
        // Updated query to align with new database structure
        $query = "SELECT id_usuario, nombre, apellido_paterno, apellido_materno, usuario, contrasena, rol 
                  FROM " . $this->table_name . " 
                  WHERE usuario = :usuario 
                  LIMIT 0,1";
                  
        $stmt = $this->conn->prepare($query);
        
        // Sanitizar
        $usuario = htmlspecialchars(strip_tags($usuario));
        
        // Vincular parámetros
        $stmt->bindParam(":usuario", $usuario);
        
        // Ejecutar consulta
        $stmt->execute();
        
        // Verificar si se encontró el usuario
        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $stored_password = $row['contrasena'];
            
            // Verificar contraseña en texto plano
            if($contrasena === $stored_password) {
                // Create combined lastname for backward compatibility
                $apellidos = $row['apellido_paterno'] . ' ' . $row['apellido_materno'];
                
                return [
                    'success' => true,
                    'id_usuario' => $row['id_usuario'],
                    'nombre' => $row['nombre'],
                    'apellido_paterno' => $row['apellido_paterno'],
                    'apellido_materno' => $row['apellido_materno'],
                    'apellidos' => $apellidos, 
                    'usuario' => $row['usuario'],
                    'rol' => $row['rol']
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Contraseña incorrecta'
                ];
            }
        } else {
            return [
                'success' => false,
                'message' => 'Usuario no encontrado'
            ];
        }
    }
}

// Procesar la solicitud
$database = new Database();
$db = $database->getConnection();
$login = new Login($db);

// Obtener los datos enviados
$data = json_decode(file_get_contents("php://input"));

// Verificar que se recibieron los datos
if(isset($data->usuario) && isset($data->contrasena)) {
    $result = $login->authenticate($data->usuario, $data->contrasena);
    
    // Devolver la respuesta
    echo json_encode($result);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Faltan datos de usuario o contraseña"
    ]);
}
?>
