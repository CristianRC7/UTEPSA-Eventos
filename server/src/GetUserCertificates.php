<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../conexion.php';
require_once __DIR__ . '/library/vendor/tecnickcom/tcpdf/tcpdf.php';

class UserCertificates {
    private $conn;
    public function __construct($db) {
        $this->conn = $db;
    }

    public function getCertificates($id_usuario) {
        $sql = "SELECT c.id_certificado, c.nro_certificado, e.titulo AS nombre_evento, e.certificado_img
                FROM certificados c
                JOIN inscripciones i ON c.id_inscripcion = i.id_inscripcion
                JOIN eventos e ON i.id_evento = e.id_evento
                WHERE i.id_usuario = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$id_usuario]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCertificateData($id_certificado, $id_usuario) {
        $sql = "SELECT c.nro_certificado, e.titulo AS nombre_evento, e.certificado_img, e.fecha_inicio, e.fecha_fin, u.nombre, u.apellido_paterno, u.apellido_materno
                FROM certificados c
                JOIN inscripciones i ON c.id_inscripcion = i.id_inscripcion
                JOIN eventos e ON i.id_evento = e.id_evento
                JOIN usuarios u ON i.id_usuario = u.id_usuario
                WHERE c.id_certificado = ? AND i.id_usuario = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$id_certificado, $id_usuario]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

$database = new Database();
$db = $database->getConnection();
$certObj = new UserCertificates($db);

$id_usuario = isset($_GET['id_usuario']) ? $_GET['id_usuario'] : null;

if ($id_usuario === null) {
    echo json_encode(['success' => false, 'message' => 'Falta id_usuario', 'certificados' => []]);
    exit;
}

// --- Nueva funcionalidad: descarga de PDF ---
if (isset($_GET['download_certificado']) && isset($_GET['id_usuario'])) {
    $id_certificado = $_GET['download_certificado'];
    $id_usuario = $_GET['id_usuario'];
    $data = $certObj->getCertificateData($id_certificado, $id_usuario);
    if (!$data) {
        echo "No se encontró el certificado.";
        exit;
    }
    $nombreCompleto = $data['nombre'] . ' ' . $data['apellido_paterno'] . ' ' . $data['apellido_materno'];
    $nroCertificado = $data['nro_certificado'];
    $nombreEvento = $data['nombre_evento'];
    $imgFondo = $data['certificado_img'];
    // Determinar la gestión (año) desde la fecha_inicio del evento
    $gestion = date('Y', strtotime($data['fecha_inicio']));
    // Ruta de la imagen de fondo
    $imageFile = __DIR__ . "/certificate/" . $imgFondo;
    if (!file_exists($imageFile)) {
        echo "No se encontró la imagen de fondo del certificado.";
        exit;
    }
    // Crear PDF
    $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->SetMargins(0, 0, 0);
    $pdf->SetAutoPageBreak(false, 0);
    $pdf->AddPage();
    $pdf->Image($imageFile, 0, 0, $pdf->getPageWidth(), $pdf->getPageHeight(), '', '', '', false, 300, '', false, false, 0, false, false, false);
    // Nombre completo centrado
    $pdf->SetFont('helvetica', 'B', 26);
    $xNombre = ($pdf->getPageWidth() - $pdf->GetStringWidth($nombreCompleto)) / 2;
    // Posición Y dinámica según gestión
    if ($gestion == 2021) {
        $yNombre = 138;
    } elseif ($gestion == 2022) {
        $yNombre = 143;
    } elseif ($gestion == 2024) {
        $yNombre = 128;
    } else {
        $yNombre = 125;
    }
    $pdf->Text($xNombre, $yNombre, $nombreCompleto);
    // Número de certificado
    $pdf->SetFont('helvetica', 'B', 14);
    $xNroCertificado = $pdf->getPageWidth() - 30;
    $yNroCertificado = $pdf->getPageHeight() - 5;
    $pdf->Text($xNroCertificado, $yNroCertificado, 'Nro: ' . $nroCertificado);
    // Descargar PDF
    $pdf->Output('certificado_' . $gestion . '.pdf', 'D');
    exit;
}

$certificados = $certObj->getCertificates($id_usuario);
echo json_encode(['success' => true, 'certificados' => $certificados]); 