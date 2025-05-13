export interface ScheduleActivity {
  id_actividad: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  dia_numero: number;
  inscripcion_habilitada?: boolean;
  inscrito?: boolean;
}

export interface GroupedSchedule {
  fecha: string;
  dia_numero: number;
  actividades: ScheduleActivity[];
}
